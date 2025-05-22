import { InternalServerError, MethotNotAllowedError } from 'infra/errors'

function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethotNotAllowedError()
  response.status(publicErrorObject.statusCode).json(publicErrorObject)
}

function onErrorHandler(error, request, response) {
  const publicErrorObject = new InternalServerError({
    statusCode: error.statusCode,
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
