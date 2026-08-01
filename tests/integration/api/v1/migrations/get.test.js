import webserver from 'infra/webserver'
import orchestrator from 'tests/orchestrator'

beforeAll(async () => {
  await orchestrator.waitForServerAvailability()
  await orchestrator.clearDatabase()
  await orchestrator.runPendingMigrations()
})

describe('GET to api/v1/migrations', () => {
  describe('Anonymous User', () => {
    test('Retrieving pending migrations', async () => {
      const response = await fetch(`${webserver.origin}/api/v1/migrations`)
      expect(response.status).toBe(403)

      const responseBody = await response.json()
      expect(responseBody).toEqual({
        name: 'ForbiddenError',
        message: 'Você não possui permissão para executar esta ação.',
        action: 'Verifique se o seu usuário possui a feature "read:migration"',
        status_code: 403,
      })
    })
  })

  describe('Defalt User', () => {
    test('Retrieving pending migrations', async () => {
      const createdUser = await orchestrator.createUser()
      const activatedUser = await orchestrator.activateUser(createdUser)
      const sessionObject = await orchestrator.createSession(activatedUser.id)

      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      })

      expect(response.status).toBe(403)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        name: 'ForbiddenError',
        message: 'Você não possui permissão para executar esta ação.',
        action: 'Verifique se o seu usuário possui a feature "read:migration"',
        status_code: 403,
      })
    })
  })

  describe('Privileged User', () => {
    test('With `read:migration`', async () => {
      const createdUser = await orchestrator.createUser()
      const activatedUser = await orchestrator.activateUser(createdUser)
      await orchestrator.addFeaturesToUser(createdUser, ['read:migration'])
      const sessionObject = await orchestrator.createSession(activatedUser.id)

      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      })

      expect(response.status).toBe(200)
      const responseBody = await response.json()
      expect(Array.isArray(responseBody)).toBe(true)
      expect(responseBody.length).toBe(0)
    })
  })
})
