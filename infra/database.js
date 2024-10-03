import { Client } from "pg";

async function query(queryObj) {
  const client = new Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
    ssl: getSSLOptions(),
  });

  try {
    await client.connect();
    const result = await client.query(queryObj);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await client.end();
  }
}

function getSSLOptions() {

  // If we have a CA, we need to use SSL
  if (process.env.PROSTGRES_CA !== undefined) {
    return {
      ca: process.env.PROSTGRES_CA,
    };
  }
  // In development, we don't need SSL to connect to the database
  return process.env.NODE_ENV === "development" ? false : true;
}

export default {
  query: query,
};
