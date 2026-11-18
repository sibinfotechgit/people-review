import type { DatabaseClient } from "./client";
import { createDatabaseClient } from "./client";

const databaseGlobal = globalThis as unknown as { publicReviewDatabase?: DatabaseClient };

export function getDatabase() {
  databaseGlobal.publicReviewDatabase ??= createDatabaseClient();
  return databaseGlobal.publicReviewDatabase;
}