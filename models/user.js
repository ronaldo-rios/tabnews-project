import database from 'infra/database'
import { ValidationError } from 'infra/errors'

async function create(userData) {
  await validateUniqueEmail(userData.email)
  await validateUniqueUsername(userData.username.trim())

  const newUser = await runInsert(userData)
  return newUser

  async function validateUniqueEmail(email) {
    const userEmail = await database.query({
      text: `SELECT email 
                FROM users 
                    WHERE LOWER(email) = LOWER($1);`,
      values: [email],
    })

    if (userEmail.rowCount > 0) {
      throw new ValidationError({
        message: 'Email informado já está em uso.',
        action: 'Utilize outro email para realizar esta operação.',
      })
    }
  }

  async function validateUniqueUsername(username) {
    const usernameResult = await database.query({
      text: `SELECT username 
                FROM users 
                    WHERE LOWER(username) = LOWER($1);`,
      values: [username],
    })

    if (usernameResult.rowCount > 0) {
      throw new ValidationError({
        message: 'O username informado já está sendo utilizado.',
        action: 'Utilize outro username para realizar esta operação.',
      })
    }
  }

  async function runInsert(userData) {
    const newUser = await database.query({
      text: `INSERT INTO 
                users (username, email, password) 
                VALUES 
                    ($1, $2, $3)
                RETURNING *;`,
      values: [userData.username, userData.email, userData.password],
    })

    return newUser.rows[0]
  }
}

const user = {
  create,
}

export default user
