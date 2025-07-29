import database from 'infra/database'
import { NotFoundError, ValidationError } from 'infra/errors'
import password from './password'

async function create(userData) {
  await validateUniqueUsername(userData.username.trim())
  await validateUniqueEmail(userData.email.trim())
  await hashPasswordInObject(userData)

  const newUser = await runInsert(userData)
  return newUser

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

async function update(username, userInputValues) {
  const currentUser = await findOneByUsername(username)

  if ('username' in userInputValues) {
    await validateUniqueUsername(userInputValues.username.trim())
  }

  if ('email' in userInputValues) {
    await validateUniqueEmail(userInputValues.email.trim())
  }

  if ('password' in userInputValues) {
    await hashPasswordInObject(userInputValues)
  }

  const userWithNewValues = { ...currentUser, ...userInputValues }
  const updated = await runUpdateQuery(userWithNewValues)
  return updated

  async function runUpdateQuery(userValues) {
    const results = await database.query({
      text: `
        UPDATE
          users
          SET 
            username = $2,
            email = $3,
            password = $4,
            updated_at = timezone('utc', now())
        WHERE id = $1
          RETURNING *;
      `,
      values: [
        userValues.id,
        userValues.username,
        userValues.email,
        userValues.password,
      ],
    })

    return results.rows[0]
  }
}

async function findOneByUsername(username) {
  const user = await queryUser(username)
  return user

  async function queryUser(username) {
    const result = await database.query({
      text: `
          SELECT * FROM users
          WHERE LOWER(username) = LOWER($1)
          LIMIT 1;
        `,
      values: [username],
    })

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: 'Username informado não foi encontrado no sistema.',
        action: 'Verifique se o username foi enviado corretamente.',
      })
    }

    return result.rows[0]
  }
}

async function findOneByEmail(email) {
  const user = await queryEmail(email)
  return user

  async function queryEmail(email) {
    const result = await database.query({
      text: `
          SELECT * FROM users
          WHERE LOWER(email) = LOWER(TRIM($1))
          LIMIT 1;
        `,
      values: [email],
    })

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: 'E-mail informado não foi encontrado no sistema.',
        action: 'Verifique se o e-mail foi enviado corretamente.',
      })
    }

    return result.rows[0]
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

async function hashPasswordInObject(userInputValues) {
  const hashedPassword = await password.hash(userInputValues.password)
  userInputValues.password = hashedPassword
}

const user = {
  create,
  update,
  findOneByUsername,
  findOneByEmail,
}

export default user
