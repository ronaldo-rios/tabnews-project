import { faker } from '@faker-js/faker'
import retry from 'async-retry'
import database from 'infra/database'
import migrator from 'models/migrator'
import session from 'models/session'
import user from 'models/user'
import { BASE_URL } from 'tests/config.integration'

const emailHttpUrl = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`

async function waitForServerAvailability() {
  await waitForWebServer()

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    })

    async function fetchStatusPage() {
      const response = await fetch(`${BASE_URL}/api/v1/status`)

      if (response.status !== 200) {
        throw Error()
      }
    }
  }
}

async function clearDatabase() {
  await database.query('DROP SCHEMA PUBLIC CASCADE; CREATE SCHEMA PUBLIC;')
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations()
}

async function createUser(userObject) {
  return await user.create({
    username:
      userObject?.username || faker.internet.username().replace(/[_.-]/g, ''),
    email: userObject?.email || faker.internet.email(),
    password: userObject?.password || 'default#password',
  })
}

async function createSession(userId) {
  return await session.create(userId)
}

async function deleteAllEmails() {
  await fetch(`${emailHttpUrl}/messages`, {
    method: 'DELETE',
  })
}

async function getLastEmail() {
  const emailListResponse = await fetch(`${emailHttpUrl}/messages`)
  const emailListBody = await emailListResponse.json()
  const lastEmailItem = emailListBody.pop()

  const emailTextResponse = await fetch(
    `${emailHttpUrl}/messages/${lastEmailItem.id}.plain`,
  )
  const emailTextBody = await emailTextResponse.text()

  lastEmailItem.text = emailTextBody
  return lastEmailItem
}

const orchestrator = {
  waitForServerAvailability,
  clearDatabase,
  runPendingMigrations,
  createUser,
  createSession,
  deleteAllEmails,
  getLastEmail,
}

export default orchestrator
