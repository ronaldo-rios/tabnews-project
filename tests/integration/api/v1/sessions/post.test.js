import session from 'models/session'
import setCookieParser from 'set-cookie-parser'
import { BASE_URL } from 'tests/config.integration'
import orchestrator from 'tests/orchestrator'
import { version as uuidVersion } from 'uuid'

beforeAll(async () => {
  await orchestrator.waitForServerAvailability()
  await orchestrator.clearDatabase()
  await orchestrator.runPendingMigrations()
})

describe('POST /api/v1/sessions', () => {
  test('With incorrect email but correct password', async () => {
    await orchestrator.createUser({
      password: 'correctPass',
    })

    const response = await fetch(`${BASE_URL}/api/v1/sessions`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        email: 'email.wrong@gmail.com',
        password: 'correctPass',
      }),
    })

    expect(response.status).toBe(401)

    const responseBody = await response.json()

    expect(responseBody).toEqual({
      name: 'UnauthorizedError',
      message: 'Dados enviados para autenticação incorretos!',
      action: 'Verifique se os dados de login enviados estão corretos.',
      status_code: 401,
    })
  })

  test('With correct email but incorrect password', async () => {
    await orchestrator.createUser({
      email: 'email.correct@gmail.com',
    })

    const response = await fetch(`${BASE_URL}/api/v1/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'email.correct@gmail.com',
        password: 'incorrect-pass',
      }),
    })

    expect(response.status).toBe(401)

    const responseBody = await response.json()

    expect(responseBody).toEqual({
      name: 'UnauthorizedError',
      message: 'Dados enviados para autenticação incorretos!',
      action: 'Verifique se os dados de login enviados estão corretos.',
      status_code: 401,
    })
  })

  test('With incorrect email and incorrect password', async () => {
    await orchestrator.createUser()

    const response = await fetch(`${BASE_URL}/api/v1/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'email.incorrect@gmail.com',
        password: 'incorrect-pass',
      }),
    })

    expect(response.status).toBe(401)

    const responseBody = await response.json()

    expect(responseBody).toEqual({
      name: 'UnauthorizedError',
      message: 'Dados enviados para autenticação incorretos!',
      action: 'Verifique se os dados de login enviados estão corretos.',
      status_code: 401,
    })
  })

  test('With correct email and correct password', async () => {
    const createdUser = await orchestrator.createUser({
      email: 'correct@validemail.com',
      password: 'correct#pass',
    })

    const response = await fetch(`${BASE_URL}/api/v1/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'correct@validemail.com',
        password: 'correct#pass',
      }),
    })

    expect(response.status).toBe(201)
    const responseBody = await response.json()

    expect(responseBody).toEqual({
      id: responseBody.id,
      token: responseBody.token,
      user_id: createdUser.id,
      expires_at: responseBody.expires_at,
      created_at: responseBody.created_at,
      updated_at: responseBody.updated_at,
    })

    expect(uuidVersion(responseBody.id)).toBe(4)
    expect(Date.parse(responseBody.expires_at)).not.toBeNaN()
    expect(Date.parse(responseBody.created_at)).not.toBeNaN()
    expect(Date.parse(responseBody.updated_at)).not.toBeNaN()

    const expiresAt = new Date(responseBody.expires_at)
    const createdAt = new Date(responseBody.created_at)

    expiresAt.setMilliseconds(0)
    createdAt.setMilliseconds(0)

    expect(expiresAt - createdAt).toBe(session.EXPIRATION_IN_MILLISECONDS)

    const parsedSetCookie = setCookieParser(response, {
      map: true,
    })
    expect(parsedSetCookie.session_id).toEqual({
      name: 'session_id',
      value: responseBody.token,
      maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
      path: '/',
      httpOnly: true,
    })
  })
})
