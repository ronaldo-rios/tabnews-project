import password from 'models/password'
import user from 'models/user'
import { BASE_URL } from 'tests/config.integration'
import orchestrator from 'tests/orchestrator'
import { version as uuidVersion } from 'uuid'

beforeAll(async () => {
  await orchestrator.waitForServerAvailability()
  await orchestrator.clearDatabase()
  await orchestrator.runPendingMigrations()
})

describe('PATCH /api/v1/users/[username]', () => {
  test('With nonexistent username', async () => {
    const response = await fetch(
      `${BASE_URL}/api/v1/users/UsuarioInexistente`,
      {
        method: 'PATCH',
      },
    )

    expect(response.status).toBe(404)

    const responseBody = await response.json()

    expect(responseBody).toEqual({
      name: 'NotFoundError',
      message: 'Username informado não foi encontrado no sistema.',
      action: 'Verifique se o username foi enviado corretamente.',
      status_code: 404,
    })
  })

  test("With duplicated 'username'", async () => {
    await orchestrator.createUser({
      username: 'user1',
    })

    await orchestrator.createUser({
      username: 'user2',
    })

    const response = await fetch(`${BASE_URL}/api/v1/users/user2`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'user1',
      }),
    })

    expect(response.status).toBe(400)

    const responseBody = await response.json()

    expect(responseBody).toEqual({
      name: 'ValidationError',
      message: 'O username informado já está sendo utilizado.',
      action: 'Utilize outro username para realizar esta operação.',
      status_code: 400,
    })
  })

  test("With duplicated 'email'", async () => {
    await orchestrator.createUser({
      email: 'email1@user.dev',
    })

    const createdUser2 = await orchestrator.createUser({
      email: 'email2@user.dev',
    })

    const response = await fetch(
      `${BASE_URL}/api/v1/users/${createdUser2.username}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'email1@user.dev',
        }),
      },
    )

    expect(response.status).toBe(400)

    const responseBody = await response.json()

    expect(responseBody).toEqual({
      name: 'ValidationError',
      message: 'Email informado já está em uso.',
      action: 'Utilize outro email para realizar esta operação.',
      status_code: 400,
    })
  })

  test("With unique 'username'", async () => {
    const createUser = await orchestrator.createUser({
      username: 'uniqueUser1',
      email: 'uniqueUser1@curso.dev',
      password: 'senha123',
    })

    const response = await fetch(
      `${BASE_URL}/api/v1/users/${createUser.username}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'uniqueUser2',
        }),
      },
    )

    expect(response.status).toBe(200)

    const responseBody = await response.json()

    expect(responseBody).toEqual({
      id: responseBody.id,
      username: 'uniqueUser2',
      email: createUser.email,
      password: responseBody.password,
      created_at: responseBody.created_at,
      updated_at: responseBody.updated_at,
    })

    expect(uuidVersion(responseBody.id)).toBe(4)
    expect(Date.parse(responseBody.created_at)).not.toBeNaN()
    expect(Date.parse(responseBody.updated_at)).not.toBeNaN()

    expect(responseBody.updated_at > responseBody.created_at).toBe(true)
  })

  test("With unique 'email'", async () => {
    const createdUser = await orchestrator.createUser({
      username: 'uniqueEmail1',
      email: 'uniqueEmail1@curso.dev',
    })

    const response = await fetch(
      `${BASE_URL}/api/v1/users/${createdUser.username}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'uniqueemail2@curso.dev',
        }),
      },
    )

    expect(response.status).toBe(200)

    const responseBody = await response.json()

    expect(responseBody).toEqual({
      id: responseBody.id,
      username: createdUser.username,
      email: 'uniqueemail2@curso.dev',
      password: responseBody.password,
      created_at: responseBody.created_at,
      updated_at: responseBody.updated_at,
    })

    expect(uuidVersion(responseBody.id)).toBe(4)
    expect(Date.parse(responseBody.created_at)).not.toBeNaN()
    expect(Date.parse(responseBody.updated_at)).not.toBeNaN()

    expect(responseBody.updated_at > responseBody.created_at).toBe(true)
  })

  test("With new 'password'", async () => {
    const createdUserNewPass = await orchestrator.createUser({
      password: 'newPassword1',
    })

    const response = await fetch(
      `${BASE_URL}/api/v1/users/${createdUserNewPass.username}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: 'newPassword2',
        }),
      },
    )

    expect(response.status).toBe(200)

    const responseBody = await response.json()

    expect(responseBody).toEqual({
      id: responseBody.id,
      username: createdUserNewPass.username,
      email: createdUserNewPass.email,
      password: responseBody.password,
      created_at: responseBody.created_at,
      updated_at: responseBody.updated_at,
    })

    expect(uuidVersion(responseBody.id)).toBe(4)
    expect(Date.parse(responseBody.created_at)).not.toBeNaN()
    expect(Date.parse(responseBody.updated_at)).not.toBeNaN()

    expect(responseBody.updated_at > responseBody.created_at).toBe(true)

    const userInDatabase = await user.findOneByUsername(
      createdUserNewPass.username,
    )
    const correctPasswordMatch = await password.compare(
      'newPassword2',
      userInDatabase.password,
    )

    const incorrectPasswordMatch = await password.compare(
      'newPassword1',
      userInDatabase.password,
    )

    expect(correctPasswordMatch).toBe(true)
    expect(incorrectPasswordMatch).toBe(false)
  })
})
