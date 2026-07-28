import controller from 'infra/controller'
import activation from 'models/activation'
import user from 'models/user'
import { createRouter } from 'next-connect'

export default createRouter()
  .use(controller.injectAnonymousOrUser)
  .post(controller.canRequest('create:user'), postUsers)
  .handler(controller.errorHandlers)

async function postUsers(request, response) {
  const userInputValues = request.body
  const newUser = await user.create(userInputValues)

  const activationToken = await activation.createToken(newUser.id)
  await activation.sendEmailToUser(newUser, activationToken)

  return response.status(201).json(newUser)
}
