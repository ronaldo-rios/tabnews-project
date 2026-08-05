import webserver from 'infra/webserver'
import activation from 'models/activation'
import user from 'models/user'
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
  let createSessionsResponseBody

  test('Create user account', async () => {
    const createUserResponse = await fetch(`${webserver.origin}/api/v1/users`, {
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
      features: ['read:activation_token'],
      created_at: createUserResponseBody.created_at,
      updated_at: createUserResponseBody.updated_at,
    })
  })

  test('Receive activation email', async () => {
    const lastEmail = await orchestrator.getLastEmail()

    expect(lastEmail.sender).toBe(`<sender@${process.env.APP_URL}>`)
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

  test('Activate account', async () => {
    const activationResponse = await fetch(
      `${webserver.origin}/api/v1/activations/${activationTokenId}`,
      {
        method: 'PATCH',
      },
    )

    expect(activationResponse.status).toBe(200)
    const activationResponseBody = await activationResponse.json()
    expect(Date.parse(activationResponseBody.used_at)).not.toBeNaN()

    const activatedUser = await user.findOneByUsername('RegistrationFlow')
    expect(activatedUser.features).toEqual([
      'create:session',
      'read:session',
      'update:user',
    ])
  })

  test('Login', async () => {
    const createSessionsResponse = await fetch(
      `${webserver.origin}/api/v1/sessions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'registration.flow@test.dev',
          password: 'RegistrationFlowPassword',
        }),
      },
    )

    expect(createSessionsResponse.status).toBe(201)
    createSessionsResponseBody = await createSessionsResponse.json()
    expect(createSessionsResponseBody.user_id).toBe(createUserResponseBody.id)
  })

  test('Get user information', async () => {
    const userResponse = await fetch(`${webserver.origin}/api/v1/user`, {
      headers: {
        cookie: `session_id=${createSessionsResponseBody.token}`,
      },
    })

    expect(userResponse.status).toBe(200)
    const userResponseBody = await userResponse.json()
    expect(userResponseBody.id).toBe(createUserResponseBody.id)
  })
})
