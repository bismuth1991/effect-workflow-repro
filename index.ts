import { ClusterWorkflowEngine } from '@effect/cluster'
import {
  NodeClusterRunnerSocket,
  NodeClusterShardManagerSocket,
  NodeContext,
  NodeRuntime,
} from '@effect/platform-node'
import { SqliteClient } from '@effect/sql-sqlite-node'

import { Activity, Workflow } from '@effect/workflow'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Schema from 'effect/Schema'

const EmailWorkflow = Workflow.make({
  name: 'EmailWorkflow',
  payload: Schema.Struct({
    id: Schema.String,
    to: Schema.String,
  }),
  idempotencyKey: ({ id }) => id,
})

const EmailWorkflowLayer = EmailWorkflow.toLayer(
  Effect.fn(function*(payload, executionId) {
    yield* Activity.make({
      name: 'SendEmail',
      execute: Effect.gen(function*() {
        const attempt = yield* Activity.CurrentAttempt

        yield* Effect.annotateLogs(Effect.logInfo(`Sending email`), {
          id: payload.id,
          executionId,
          attempt,
        })
      }),
    })
  }),
)

const SqlLayer = SqliteClient.layer({
  filename: 'packages/playground/src/workflow/workflow.db',
})

function createRunnerLayer(clientOnly = false) {
  return EmailWorkflowLayer.pipe(
    Layer.provide(
      ClusterWorkflowEngine.layer.pipe(
        Layer.provide(
          NodeClusterRunnerSocket.layer({
            storage: 'sql',
            clientOnly,
          }).pipe(
            Layer.provide(SqlLayer),
          ),
        ),
      ),
    ),
    Layer.provideMerge(NodeContext.layer),
  )
}

const RunnerLayer = createRunnerLayer()
const RunnerLayerClient = createRunnerLayer(true)

const ShardManagerLayer = NodeClusterShardManagerSocket.layer({
  storage: 'sql',
}).pipe(Layer.provide(SqlLayer))

const program = Effect.gen(function*() {
  yield* Effect.addFinalizer(() => Effect.logInfo('Shutting down...'))

  yield* RunnerLayer.pipe(
    Layer.launch,
    Effect.fork,
  )

  yield* ShardManagerLayer.pipe(
    Layer.launch,
    Effect.fork,
  )

  yield* Effect.forEach(
    [1, 1],
    (id) =>
      EmailWorkflow.execute({
        id: id.toString(),
        to: 'example@gmail.com',
      }),
    { concurrency: 'unbounded' },
  ).pipe(
    Effect.flatMap(() => Effect.void),
    Effect.provide(RunnerLayerClient),
  )

  return yield* Effect.never
})

program.pipe(
  Effect.scoped,
  NodeRuntime.runMain,
)
