import database from 'infra/database'
import migrator from 'models/migrator'
import password from 'models/password'
import user from 'models/user'
import { BASE_URL } from 'tests/integration/api/v1/config.integration'
import { version as uuidversion } from 'uuid'

const cleanDatabase = async () => {
  await database.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;')
}

beforeAll(async () => {
  await cleanDatabase(), await migrator.runPendingMigrations()
})

describe('POST /api/v1/users', () => {
  test('With unique and valid data', async () => {
    const response = await fetch(`${BASE_URL}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        email: 'contact@testuser.com',
        password: 'pass123',
      }),
    })

    expect(response.status).toBe(201)

    const responseBody = await response.json()
    expect(responseBody).toEqual({
      id: responseBody.id,
      username: 'testuser',
      email: 'contact@testuser.com',
      password: responseBody.password,
      created_at: responseBody.created_at,
      updated_at: responseBody.updated_at,
    })

    expect(uuidversion(responseBody.id)).toBe(4)
    expect(Date.parse(responseBody.created_at)).not.toBeNaN()
    expect(Date.parse(responseBody.updated_at)).not.toBeNaN()

    const userInDatabase = await user.findOneByUsername('testuser')
    const correctPasswordMatch = await password.compare(
      'pass123',
      userInDatabase.password,
    )

    expect(correctPasswordMatch).toBe(true)
  })

  test('With duplicated email', async () => {
    const response1 = await fetch(`${BASE_URL}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        username: 'userduplicatedemail1',
        email: 'contact@userduplicatedemail.com',
        password: 'pass123',
      }),
    })

    expect(response1.status).toBe(201)

    const response2 = await fetch(`${BASE_URL}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        username: 'userduplicatedemail2',
        email: 'CONTACT@userduplicatedemail.com',
        password: 'pass123',
      }),
    })

    expect(response2.status).toBe(400)

    const responseBody = await response2.json()

    expect(responseBody).toEqual({
      name: 'ValidationError',
      message: 'Email informado já está em uso.',
      action: 'Utilize outro email para realizar esta operação.',
      status_code: 400,
    })
  })

  test('With duplicated username', async () => {
    const response1 = await fetch(`${BASE_URL}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'usernameduplicated',
        email: 'usernameduplicated1@curso.dev',
        password: 'senha123',
      }),
    })

    expect(response1.status).toBe(201)

    const response2 = await fetch(`${BASE_URL}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'UsernameDuplicated',
        email: 'usernameduplicated2@curso.dev',
        password: 'senha123',
      }),
    })

    expect(response2.status).toBe(400)

    const response2Body = await response2.json()

    expect(response2Body).toEqual({
      name: 'ValidationError',
      message: 'O username informado já está sendo utilizado.',
      action: 'Utilize outro username para realizar esta operação.',
      status_code: 400,
    })
  })
})
