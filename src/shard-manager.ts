import * as Layer from 'effect/Layer'
import {
  NodeClusterShardManagerSocket,
  NodeRuntime,
} from '@effect/platform-node'
import { SqlLive } from './Sql'

NodeClusterShardManagerSocket.layer({
  storage: 'sql',
}).pipe(
  Layer.provide(SqlLive),
  Layer.launch,
  NodeRuntime.runMain
)
