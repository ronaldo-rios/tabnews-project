import database from "infra/database"
import { BASE_URL } from "tests/integration/api/v1/config.integration"

const cleanDatabase = async () => {
  await database.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;")
}

beforeAll(async () => await cleanDatabase())

test("POST to api/v1/migrations should return 201", async () => {
  /* When exists pending migrations to run the status code should be 201 
  after run the migrations */
  const response = await fetch(`${BASE_URL}/api/v1/migrations`, {
    method: "POST",
  })
  expect(response.status).toBe(201)

  const responseBody = await response.json()
  expect(Array.isArray(responseBody)).toBe(true)
  expect(responseBody.length).toBeGreaterThan(0)
})

test("POST to api/v1/migrations should return 200", async () => {
  /* When not exists pending migrations to run the status code should be 200 
  why the migrations are already up */
  const response = await fetch(`${BASE_URL}/api/v1/migrations`, {
    method: "POST",
  })
  expect(response.status).toBe(200)

  const responseBody = await response.json()
  expect(Array.isArray(responseBody)).toBe(true)
  expect(responseBody.length).toBe(0)
})
