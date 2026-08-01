import controller from 'infra/controller'
import authorization from 'models/authorization'
import migrator from 'models/migrator'
import { createRouter } from 'next-connect'

export default createRouter()
  .use(controller.injectAnonymousOrUser)
  .get(controller.canRequest('read:migration'), getMigrations)
  .post(controller.canRequest('create:migration'), postMigrations)
  .handler(controller.errorHandlers)

async function getMigrations(request, response) {
  const pendingMigrations = await migrator.listPendingMigrations()
  const secureOutputValues = authorization.filterOutput(
    request.context.user,
    'read:migration',
    pendingMigrations,
  )
  return response.status(200).json(secureOutputValues)
}

async function postMigrations(request, response) {
  const migratedMigrations = await migrator.runPendingMigrations()
  const secureOutputValues = authorization.filterOutput(
    request.context.user,
    'read:migration',
    migratedMigrations,
  )
  return migratedMigrations.length > 0
    ? response.status(201).json(secureOutputValues)
    : response.status(200).json(secureOutputValues)
}
