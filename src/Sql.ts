import { SqliteClient } from '@effect/sql-sqlite-node'

export const SqlLive = SqliteClient.layer({
  filename: 'workflow.db',
})
