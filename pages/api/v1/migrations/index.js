import controller from 'infra/controller'
import migrator from 'models/migrator'
import { createRouter } from 'next-connect'

const router = createRouter()
router.get(getMigrations)
router.post(postMigrations)
export default router.handler(controller.errorHandlers)

async function getMigrations(request, response) {
  const pendingMigrations = await migrator.listPendingMigrations()
  return response.status(200).json(pendingMigrations)
}

async function postMigrations(request, response) {
  const migratedMigrations = await migrator.runPendingMigrations()
  return migratedMigrations.length > 0
    ? response.status(201).json(migratedMigrations)
    : response.status(200).json(migratedMigrations)
}
