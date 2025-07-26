import { BASE_URL } from 'tests/config.integration'
import orchestrator from 'tests/orchestrator'

beforeAll(() => orchestrator.waitForServerAvailability())

describe('GET to api/v1/status', () => {
  test('Retrieving current system status', async () => {
    const response = await fetch(`${BASE_URL}/api/v1/status`)
    expect(response.status).toBe(200)

    const responseBody = await response.json()
    expect(responseBody.updated_at).toBeDefined()

    const parseUpdatedAt = new Date(responseBody.updated_at).toISOString()
    expect(responseBody.updated_at).toEqual(parseUpdatedAt)
    expect(responseBody.dependencies.database.version).toEqual('16.0')
    expect(responseBody.dependencies.database.max_connections).toEqual(100)
    expect(
      responseBody.dependencies.database.opened_connections,
    ).toBeGreaterThanOrEqual(1)
  })
})
