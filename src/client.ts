import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import { EmailWorkflow, EmailWorkflowLive } from "./EmailWorkflow";
import { WorkflowEngineClientLive } from './WorkflowEngine';
import { NodeRuntime } from '@effect/platform-node'

EmailWorkflow.execute({
  id: '1',
  to: 'example@example.com',
}).pipe(
  Effect.repeatN(1),
  Effect.provide(
    Layer.provide(
      EmailWorkflowLive,
      WorkflowEngineClientLive
    )
  ),
  NodeRuntime.runMain
)
