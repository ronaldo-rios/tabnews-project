import * as cookie from 'cookie'
import controller from 'infra/controller'
import authentication from 'models/authentication'
import session from 'models/session'
import { createRouter } from 'next-connect'

const router = createRouter()
router.post(postSessions)
export default router.handler(controller.errorHandlers)

async function postSessions(request, response) {
  const inputValues = request.body
  const authenticatedUser = await authentication.validateAuth(
    inputValues.email,
    inputValues.password,
  )
  const generatedSession = await session.create(authenticatedUser.id)

  const setCookie = cookie.serialize('session_id', generatedSession.token, {
    path: '/',
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
    secure: process.env.NODE_ENV === 'development' ? false : true,
    httpOnly: true,
  })
  response.setHeader('Set-Cookie', setCookie)

  return response.status(201).json(generatedSession)
}
