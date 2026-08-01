import controller from 'infra/controller'
import { ForbiddenError } from 'infra/errors'
import authentication from 'models/authentication'
import authorization from 'models/authorization'
import session from 'models/session'
import { createRouter } from 'next-connect'

export default createRouter()
  .use(controller.injectAnonymousOrUser)
  .post(controller.canRequest('create:session'), postSessions)
  .delete(deleteSession)
  .handler(controller.errorHandlers)

async function postSessions(request, response) {
  const inputValues = request.body
  const authenticatedUser = await authentication.validateAuthentication(
    inputValues.email,
    inputValues.password,
  )

  if (!authorization.can(authenticatedUser, 'create:session')) {
    throw new ForbiddenError({
      message: 'Você não possui permissão para fazer login.',
      action: 'Contate o suporte caso você acredite que isto seja um erro.',
    })
  }

  const generatedSession = await session.create(authenticatedUser.id)
  controller.setSessionCookie(generatedSession.token, response)

  const secureOutputValues = authorization.filterOutput(
    authenticatedUser,
    'read:session',
    generatedSession,
  )

  return response.status(201).json(secureOutputValues)
}

async function deleteSession(request, response) {
  const sessionToken = request.cookies.session_id
  const sessionObject = await session.findOneValidByToken(sessionToken)
  const expiredSession = await session.expireById(sessionObject.id)
  controller.clearSessionCookie(response)

  const secureOutputValues = authorization.filterOutput(
    request.context.user,
    'read:session',
    expiredSession,
  )

  return response.status(200).json(secureOutputValues)
}
