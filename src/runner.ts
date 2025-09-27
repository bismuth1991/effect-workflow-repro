import * as Layer from 'effect/Layer'
import { EmailWorkflowLive } from "./EmailWorkflow";
import { WorkFlowEngineLive } from './WorkflowEngine';
import { NodeRuntime } from '@effect/platform-node';

EmailWorkflowLive.pipe(
  Layer.provide(WorkFlowEngineLive),
  Layer.launch,
  NodeRuntime.runMain
)
