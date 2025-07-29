import { NotFoundError, UnauthorizedError } from 'infra/errors'
import password from 'models/password'
import user from 'models/user'

async function validateAuth(providedEmail, providedPassword) {
  try {
    const storedUser = await findUserByEmail(providedEmail)
    await validatePassword(providedPassword, storedUser.password)
    return storedUser
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: 'Dados enviados para autenticação incorretos!',
        action: 'Verifique se os dados de login enviados estão corretos.',
      })
    }

    throw error
  }

  async function findUserByEmail(providedEmail) {
    try {
      return await user.findOneByEmail(providedEmail)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: 'Email não confere!',
          action: 'Verifique o dado enviado.',
        })
      }

      throw error
    }
  }

  async function validatePassword(providedPassword, storedPassword) {
    const passwordMatch = await password.compare(
      providedPassword,
      storedPassword,
    )

    if (!passwordMatch) {
      throw new UnauthorizedError({
        message: 'Senha não confere!',
        action: 'Verifique o dado enviado.',
      })
    }
  }
}

const authentication = {
  validateAuth,
}

export default authentication
