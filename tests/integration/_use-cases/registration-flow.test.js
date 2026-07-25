import { BASE_URL } from 'tests/config.integration'
import orchestrator from 'tests/orchestrator'

beforeAll(async () => {
  await orchestrator.waitForServerAvailability()
  await orchestrator.clearDatabase()
  await orchestrator.runPendingMigrations()
  await orchestrator.deleteAllEmails()
})

describe('Use case: Registration Flow (all successful)', () => {
  let createUserResponseBody

  test('Create user account', async () => {
    const createUserResponse = await fetch(`${BASE_URL}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'RegistrationFlow',
        email: 'registration.flow@test.com',
        password: 'RegistrationFlowPassword',
      }),
    })

    expect(createUserResponse.status).toBe(201)

    createUserResponseBody = await createUserResponse.json()

    expect(createUserResponseBody).toEqual({
      id: createUserResponseBody.id,
      username: 'RegistrationFlow',
      features: ['read:activation_token'],
      created_at: createUserResponseBody.created_at,
      updated_at: createUserResponseBody.updated_at,
    })
  })

  test('Receive activation email', async () => {})

  test('Activate account', async () => {})

  test('Login', async () => {})

  test('Get user information', async () => {})
})
