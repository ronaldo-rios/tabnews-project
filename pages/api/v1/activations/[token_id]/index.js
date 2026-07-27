import controller from 'infra/controller'
import activation from 'models/activation'
import { createRouter } from 'next-connect'

const router = createRouter()
router.patch(patchActivation)
export default router.handler(controller.errorHandlers)

async function patchActivation(request, response) {
  const activationTokenId = request.query.token_id

  const validActivationToken =
    await activation.findOneValidById(activationTokenId)
  await activation.activateUserByUserId(validActivationToken.user_id)

  const usedActivationToken =
    await activation.markTokenAsUsed(activationTokenId)

  return response.status(200).json(usedActivationToken)
}
