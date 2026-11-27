import { defineConfig } from "drizzle-kit";

// `pnpm db:generate` compares src/schema.ts with the last migration and writes
// a new SQL migration into ./drizzle. Review every generated file before committing.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://fireguard:fireguard@localhost:5432/fireguard",
  },
});
