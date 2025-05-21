import database from 'infra/database'
import { InternalServerError } from 'infra/errors'

async function status(request, response) {
  try {
    const updatedAt = new Date().toISOString()

    const databaseVersion = await database.query('SHOW server_version;')
    const databaseVersionValue = databaseVersion.rows[0].server_version

    const databaseMaxConnections = await database.query('SHOW max_connections;')
    const databaseMaxConnectionsValue =
      databaseMaxConnections.rows[0].max_connections

    const databaseOpenedConnections = await database.query(
      'SELECT count(*)::int FROM pg_stat_activity WHERE datname = current_database();',
    )
    const databaseOpenedConnectionsValue =
      databaseOpenedConnections.rows[0].count

    response.status(200).json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          version: databaseVersionValue,
          max_connections: parseInt(databaseMaxConnectionsValue),
          opened_connections: databaseOpenedConnectionsValue,
        },
      },
    })
  } catch (error) {
    const publicErrorObject = new InternalServerError({
      cause: error,
    })
    response.status(500).json(publicErrorObject)
  }
}

export default status
