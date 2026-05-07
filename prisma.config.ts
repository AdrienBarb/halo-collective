import path from "node:path";
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join("src", "lib", "db", "schema.prisma"),
  migrations: {
    path: path.join("src", "lib", "db", "migrations"),
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
  },
});
