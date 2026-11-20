import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import contract from "../../../src/prisma/contract.json" with { type: "json" };

describe("project database contract", () => {
  it("enforces project-name uniqueness per user rather than globally", () => {
    const uniques = contract.storage.namespaces.public.entries.table.Project.uniques;
    assert.deepEqual(uniques, [{ columns: ["userId", "name"] }]);
  });

  it("enforces unique file and folder names within their respective folders", () => {
    const tables = contract.storage.namespaces.public.entries.table;
    assert.deepEqual(tables.ProjectFile.uniques, [
      { columns: ["folderId", "name"] },
    ]);
    assert.deepEqual(tables.ProjectFolder.uniques, [
      { columns: ["projectId", "path"] },
    ]);
  });

  it("migrates away the former global project-name constraint", async () => {
    const migration = await readFile(
      new URL("../../../migrations/app/20260926T1612_project_name_per_user/migration.ts", import.meta.url),
      "utf8",
    );
    assert.match(migration, /dropConstraint\(\{ schema: 'public', table: 'Project', constraint: 'Project_name_key' \}\)/);
    assert.match(migration, /columns: \['userId', 'name'\]/);
  });
});
