import database from 'infra/database'
import migrationRunner from 'node-pg-migrate'
import { resolve } from 'node:path'

const defaultMigrationOptions = {
  dryRun: true,
  dir: resolve('infra', 'migrations'),
  direction: 'up',
  log: () => {},
  migrationsTable: 'pgmigrations',
}

async function listPendingMigrations() {
  let dbClient
  try {
    dbClient = await database.getNewClient()
    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient: dbClient,
    })
    return pendingMigrations
  } finally {
    await dbClient?.end()
  }
}

async function runPendingMigrations() {
  let dbClient
  try {
    dbClient = await database.getNewClient()
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient: dbClient,
      dryRun: false,
    })
    return migratedMigrations
  } finally {
    await dbClient?.end()
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
}

export default migrator
