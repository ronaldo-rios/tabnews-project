import controller from 'infra/controller'
import activation from 'models/activation'
import authorization from 'models/authorization'
import { createRouter } from 'next-connect'

export default createRouter()
  .use(controller.injectAnonymousOrUser)
  .patch(controller.canRequest('read:activation_token'), patchActivation)
  .handler(controller.errorHandlers)

async function patchActivation(request, response) {
  const activationTokenId = request.query.token_id

  const validActivationToken =
    await activation.findOneValidById(activationTokenId)
  await activation.activateUserByUserId(validActivationToken.user_id)

  const usedActivationToken =
    await activation.markTokenAsUsed(activationTokenId)

  const secureOutputValues = authorization.filterOutput(
    request.context.user,
    'read:activation_token',
    usedActivationToken,
  )

  return response.status(200).json(secureOutputValues)
}
