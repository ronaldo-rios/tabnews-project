import controller from 'infra/controller'
import authentication from 'models/authentication'
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
  const generatedSession = await session.create(authenticatedUser.id)
  controller.setSessionCookie(generatedSession.token, response)

  return response.status(201).json(generatedSession)
}

async function deleteSession(request, response) {
  const sessionToken = request.cookies.session_id
  const sessionObject = await session.findOneValidByToken(sessionToken)
  const expiredSession = await session.expireById(sessionObject.id)
  controller.clearSessionCookie(response)

  return response.status(200).json(expiredSession)
}
