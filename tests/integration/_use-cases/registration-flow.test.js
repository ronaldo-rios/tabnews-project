import webserver from 'infra/webserver'
import activation from 'models/activation'
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
  let activationTokenId

  test('Create user account', async () => {
    const createUserResponse = await fetch(`${BASE_URL}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'RegistrationFlow',
        email: 'registration.flow@test.dev',
        password: 'RegistrationFlowPassword',
      }),
    })

    expect(createUserResponse.status).toBe(201)

    createUserResponseBody = await createUserResponse.json()

    expect(createUserResponseBody).toEqual({
      id: createUserResponseBody.id,
      username: 'RegistrationFlow',
      email: 'registration.flow@test.dev',
      password: createUserResponseBody.password,
      features: ['read:activation_token'],
      created_at: createUserResponseBody.created_at,
      updated_at: createUserResponseBody.updated_at,
    })
  })

  test('Receive activation email', async () => {
    const lastEmail = await orchestrator.getLastEmail()

    expect(lastEmail.sender).toBe('<sender@test.com.br>')
    expect(lastEmail.recipients[0]).toBe('<registration.flow@test.dev>')
    expect(lastEmail.subject).toBe('Ative seu cadastro!')
    expect(lastEmail.text).toContain('RegistrationFlow')

    activationTokenId = orchestrator.extractUUID(lastEmail.text)

    expect(lastEmail.text).toContain(
      `${webserver.origin}/register/activation/${activationTokenId}`,
    )

    const activationTokenObject =
      await activation.findOneValidById(activationTokenId)

    expect(activationTokenObject.user_id).toBe(createUserResponseBody.id)
    expect(activationTokenObject.used_at).toBe(null)
  })

  test('Activate account', async () => {})

  test('Login', async () => {})

  test('Get user information', async () => {})
})
