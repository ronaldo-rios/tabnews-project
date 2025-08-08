import * as cookie from 'cookie'
import {
  InternalServerError,
  MethotNotAllowedError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from 'infra/errors'
import session from 'models/session'

function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethotNotAllowedError()
  response.status(publicErrorObject.statusCode).json(publicErrorObject)
}

function onErrorHandler(error, request, response) {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof UnauthorizedError
  ) {
    return response.status(error.statusCode).json(error)
  }

  const publicErrorObject = new InternalServerError({
    cause: error,
  })
  console.log(publicErrorObject)
  response.status(publicErrorObject.statusCode).json(publicErrorObject)
}

async function setSessionCookie(sessionToken, response) {
  const setCookie = cookie.serialize('session_id', sessionToken, {
    path: '/',
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
    secure: process.env.NODE_ENV === 'development' ? false : true,
    httpOnly: true,
  })

  response.setHeader('Set-Cookie', setCookie)
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
  setSessionCookie,
}

export default controller
