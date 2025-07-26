import { BASE_URL } from 'tests/config.integration'
import orchestrator from 'tests/orchestrator'

beforeAll(async () => {
  await orchestrator.waitForServerAvailability()
  await orchestrator.clearDatabase()
})

describe('POST /api/v1/migrations', () => {
  describe('Running pending migrations', () => {
    test('should return 201 for the first time', async () => {
      /* When exists pending migrations to run the status code should be 201 
      after run the migrations */
      const response = await fetch(`${BASE_URL}/api/v1/migrations`, {
        method: 'POST',
      })
      expect(response.status).toBe(201)

      const responseBody = await response.json()
      expect(Array.isArray(responseBody)).toBe(true)
      expect(responseBody.length).toBeGreaterThan(0)
    })

    test('should return 200 for the second time', async () => {
      /* When not exists pending migrations to run the status code should be 200 
      why the migrations are already up */
      const response = await fetch(`${BASE_URL}/api/v1/migrations`, {
        method: 'POST',
      })
      expect(response.status).toBe(200)

      const responseBody = await response.json()
      expect(Array.isArray(responseBody)).toBe(true)
      expect(responseBody.length).toBe(0)
    })
  })
})
