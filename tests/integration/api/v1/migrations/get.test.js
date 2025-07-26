import { BASE_URL } from 'tests/config.integration'
import orchestrator from 'tests/orchestrator.js'

beforeAll(async () => {
  await orchestrator.waitForServerAvailability()
  await orchestrator.clearDatabase()
})

describe('GET to api/v1/migrations', () => {
  test('Retrieving pending migrations', async () => {
    const response = await fetch(`${BASE_URL}/api/v1/migrations`)
    expect(response.status).toBe(200)

    const responseBody = await response.json()
    expect(Array.isArray(responseBody)).toBe(true)
    expect(responseBody.length).toBeGreaterThan(0)
  })
})
