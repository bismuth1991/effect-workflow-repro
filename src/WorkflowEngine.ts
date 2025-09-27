import * as Layer from 'effect/Layer'
import { NodeClusterRunnerSocket } from '@effect/platform-node'
import { ClusterWorkflowEngine } from '@effect/cluster'
import { SqlLive } from './Sql'


function makeWorkflowEngine(clientOnly = false) {
  return  ClusterWorkflowEngine.layer.pipe(
    Layer.provide(
      NodeClusterRunnerSocket.layer({
        storage: 'sql',
        clientOnly,
      }).pipe(
        Layer.provide(SqlLive),
      ),
    ),
  )
}

export const WorkFlowEngineLive = makeWorkflowEngine()
export const WorkflowEngineClientLive = makeWorkflowEngine(true)
