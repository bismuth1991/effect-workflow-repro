import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'
import { Activity, Workflow } from '@effect/workflow'

export const EmailWorkflow = Workflow.make({
  name: 'EmailWorkflow',
  payload: Schema.Struct({
    id: Schema.String,
    to: Schema.String,
  }),
  idempotencyKey: ({ id }) => id,
})

export const EmailWorkflowLive = EmailWorkflow.toLayer(
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
