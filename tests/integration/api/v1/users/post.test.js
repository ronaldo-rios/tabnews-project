import webserver from 'infra/webserver'
import password from 'models/password'
import user from 'models/user'
import orchestrator from 'tests/orchestrator'
import { version as uuidVersion } from 'uuid'

beforeAll(async () => {
  await orchestrator.waitForServerAvailability()
  await orchestrator.clearDatabase()
  await orchestrator.runPendingMigrations()
})

describe('POST /api/v1/users', () => {
  describe('Anonymous user', () => {
    test('With unique and valid data', async () => {
      const response = await fetch(`${webserver.origin}/api/v1/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'useranonymoustest',
          email: 'useranonymoustest@user.dev',
          password: 'test123',
        }),
      })

      expect(response.status).toBe(201)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: 'useranonymoustest',
        email: responseBody.email,
        features: ['read:activation_token'],
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      })

      expect(uuidVersion(responseBody.id)).toBe(4)
      expect(Date.parse(responseBody.created_at)).not.toBeNaN()
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN()

      const userInDatabase = await user.findOneByUsername('useranonymoustest')
      const correctPasswordMatch = await password.compare(
        'test123',
        userInDatabase.password,
      )

      const incorrectPasswordMatch = await password.compare(
        'incorrect123',
        userInDatabase.password,
      )

      expect(correctPasswordMatch).toBe(true)
      expect(incorrectPasswordMatch).toBe(false)
    })

    test('With duplicated `email`', async () => {
      const response1 = await fetch(`${webserver.origin}/api/v1/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'duplicated1',
          email: 'usertestduplicated@test.dev',
          password: 'secret123',
        }),
      })

      expect(response1.status).toBe(201)

      const response2 = await fetch(`${webserver.origin}/api/v1/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'duplicated2',
          email: 'UserTestDuplicated@test.dev',
          password: 'secret123',
        }),
      })

      expect(response2.status).toBe(400)

      const response2Body = await response2.json()

      expect(response2Body).toEqual({
        name: 'ValidationError',
        message: 'Email informado já está em uso.',
        action: 'Utilize outro email para realizar esta operação.',
        status_code: 400,
      })
    })

    test('With duplicated `username`', async () => {
      const response1 = await fetch(`${webserver.origin}/api/v1/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'usernamejack',
          email: 'usernameduplicatedjack1@test.dev',
          password: 'secret123',
        }),
      })

      expect(response1.status).toBe(201)

      const response2 = await fetch(`${webserver.origin}/api/v1/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'UsernameJack',
          email: 'usernameduplicatedjack2@test.dev',
          password: 'secret123',
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

  describe('Default user', () => {
    test('With unique and valid data', async () => {
      const response = await fetch(`${webserver.origin}/api/v1/users`, {
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
        features: ['read:activation_token'],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      })

      expect(uuidVersion(responseBody.id)).toBe(4)
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
      const response1 = await fetch(`${webserver.origin}/api/v1/users`, {
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

      const response2 = await fetch(`${webserver.origin}/api/v1/users`, {
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
      const response1 = await fetch(`${webserver.origin}/api/v1/users`, {
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

      const response2 = await fetch(`${webserver.origin}/api/v1/users`, {
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
})
