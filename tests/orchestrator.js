import retry from 'async-retry'
import { BASE_URL } from 'tests/config.integration'

import database from 'infra/database.js'
import migrator from 'models/migrator.js'

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

const orchestrator = {
  waitForServerAvailability,
  clearDatabase,
  runPendingMigrations,
}

export default orchestrator
