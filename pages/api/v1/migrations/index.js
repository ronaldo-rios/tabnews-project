import database from "infra/database";
import migrationRunner from "node-pg-migrate";
import { join } from "node:path";

export default async function migrations(request, response) {

    const dbClient = await database.getNewClient();
    const defaultMigrationOptions = {
        dbClient: dbClient,
        dryRun: true,
        dir: join("infra", "migrations"),
        direction: "up",
        verbose: true,
        migrationsTable: "pgmigrations",
    };

    if (request.method === "GET") {
        const pedingMigrations = await migrationRunner(defaultMigrationOptions);
        await dbClient.end();
        response.status(200).json(pedingMigrations);
    }

    if (request.method === "POST") {
        const migratedMigrations = await migrationRunner({
            ...defaultMigrationOptions,
            dryRun: false,
        });

        await dbClient.end();

        migratedMigrations.length > 0
            ? response.status(201).json(migratedMigrations)
            : response.status(200).json(migratedMigrations);
    }

    response.status(405).json({ error: error.message });
}
