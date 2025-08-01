import {
  InternalServerError,
  MethotNotAllowedError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from 'infra/errors'

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

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
}

export default controller
