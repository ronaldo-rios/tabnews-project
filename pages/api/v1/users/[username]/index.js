import controller from 'infra/controller'
import user from 'models/user'
import { createRouter } from 'next-connect'

const router = createRouter()
router.get(getUsers)
router.patch(patchUsers)
export default router.handler(controller.errorHandlers)

async function getUsers(request, response) {
  const username = request.query.username
  const userFound = await user.findOneByUsername(username)
  return response.status(200).json(userFound)
}

async function patchUsers(request, response) {
  const username = request.query.username
  const userInputValues = request.body

  const updatedUser = await user.update(username, userInputValues)
  return response.status(200).json(updatedUser)
}
