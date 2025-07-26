import { BASE_URL } from 'tests/config.integration'
import orchestrator from 'tests/orchestrator'

beforeAll(() => orchestrator.waitForServerAvailability())

// Test to validate method not allowed to endpoint:
describe('POST to api/v1/status', () => {
  test('Retrieving current system status', async () => {
    const response = await fetch(`${BASE_URL}/api/v1/status`, {
      method: 'POST',
    })
    expect(response.status).toBe(405)

    const responseBody = await response.json()
    expect(responseBody).toEqual({
      name: 'MethotNotAllowedError',
      message: 'Método não autorizado para este endpoint.',
      action: 'Verifique se o método HTTP enviado é válido para este endpoint.',
      status_code: 405,
    })
  })
})
