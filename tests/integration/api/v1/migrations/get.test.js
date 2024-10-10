import database from "infra/database"
import { BASE_URL } from "tests/integration/api/v1/config.integration"

const cleanDatabase = async () => {
  await database.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;")
}

beforeAll(async () => await cleanDatabase())

test("GET to api/v1/migrations should return 200", async () => {
  const response = await fetch(`${BASE_URL}/api/v1/migrations`)
  expect(response.status).toBe(200)

  const responseBody = await response.json()
  expect(Array.isArray(responseBody)).toBe(true)
  expect(responseBody.length).toBeGreaterThan(0)
})
