import { BASE_URL } from 'tests/config.integration'
import orchestrator from 'tests/orchestrator.js'
import { version as uuidversion } from 'uuid'

beforeAll(async () => {
  await orchestrator.waitForServerAvailability()
  await orchestrator.clearDatabase()
  await orchestrator.runPendingMigrations()
})

describe('GET /api/v1/users/[username]', () => {
  test('With exact case match', async () => {
    const response = await fetch(`${BASE_URL}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        username: 'exactcase',
        email: 'contact@exactcase.com',
        password: 'pass123',
      }),
    })

    expect(response.status).toBe(201)

    const getResponse = await fetch(`${BASE_URL}/api/v1/users/exactcase`)

    expect(getResponse.status).toBe(200)

    const responseBody = await getResponse.json()
    expect(responseBody).toEqual({
      id: responseBody.id,
      username: 'exactcase',
      email: 'contact@exactcase.com',
      password: responseBody.password,
      created_at: responseBody.created_at,
      updated_at: responseBody.updated_at,
    })

    expect(uuidversion(responseBody.id)).toBe(4)
    expect(Date.parse(responseBody.created_at)).not.toBeNaN()
    expect(Date.parse(responseBody.updated_at)).not.toBeNaN()
  })

  test('With case mismatch', async () => {
    const response = await fetch(`${BASE_URL}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        username: 'casedifferent',
        email: 'contact@case.different.com',
        password: 'pass123',
      }),
    })

    expect(response.status).toBe(201)

    const getResponse = await fetch(`${BASE_URL}/api/v1/users/CaseDifferent`)

    expect(getResponse.status).toBe(200)

    const responseBody = await getResponse.json()
    expect(responseBody).toEqual({
      id: responseBody.id,
      username: 'casedifferent',
      email: 'contact@case.different.com',
      password: responseBody.password,
      created_at: responseBody.created_at,
      updated_at: responseBody.updated_at,
    })

    expect(uuidversion(responseBody.id)).toBe(4)
    expect(Date.parse(responseBody.created_at)).not.toBeNaN()
    expect(Date.parse(responseBody.updated_at)).not.toBeNaN()
  })

  test('With nonexistent username', async () => {
    const getResponse = await fetch(`${BASE_URL}/api/v1/users/notexist`)

    expect(getResponse.status).toBe(404)

    const responseBody = await getResponse.json()
    expect(responseBody).toEqual({
      name: 'NotFoundError',
      message: 'Username informado não foi encontrado no sistema.',
      action: 'Verifique se o username foi enviado corretamente.',
      status_code: 404,
    })
  })
})
