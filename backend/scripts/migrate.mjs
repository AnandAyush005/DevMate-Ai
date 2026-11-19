import { execSync } from "node:child_process";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.log("[db:migrate] DATABASE_URL is not set. Skipping automatic migration.");
  process.exit(0);
}

console.log("[db:migrate] DATABASE_URL detected. Running database migrations...");

const runner = typeof process.versions.bun !== "undefined" ? "bunx" : "npx";

try {
  execSync(`${runner} prisma db migrate`, {
    stdio: "inherit",
    env: process.env,
  });
  console.log("[db:migrate] Database migrations applied successfully.");
} catch (error) {
  console.error("[db:migrate] Migration failed:", error);
  process.exit(1);
}
