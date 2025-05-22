import controller from 'infra/controller'
import database from 'infra/database'
import { createRouter } from 'next-connect'
import migrationRunner from 'node-pg-migrate'
import { resolve } from 'node:path'

const router = createRouter()
router.get(getMigrations)
router.post(postMigrations)
export default router.handler(controller.errorHandlers)

const defaultMigrationOptions = {
  dryRun: true,
  dir: resolve('infra', 'migrations'),
  direction: 'up',
  verbose: true,
  migrationsTable: 'pgmigrations',
}

async function getMigrations(request, response) {
  let dbClient
  try {
    dbClient = await database.getNewClient()
    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient: dbClient,
    })

    return response.status(200).json(pendingMigrations)
  } finally {
    await dbClient.end()
  }
}

async function postMigrations(request, response) {
  let dbClient
  try {
    dbClient = await database.getNewClient()
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient: dbClient,
      dryRun: false,
    })

    return migratedMigrations.length > 0
      ? response.status(201).json(migratedMigrations)
      : response.status(200).json(migratedMigrations)
  } finally {
    await dbClient.end()
  }
}
