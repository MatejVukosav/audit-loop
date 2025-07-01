import { Pool, QueryResult, QueryResultRow } from "pg";

const pool: Pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || "postgres://audit:audit@localhost:5432/audit",
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  return pool.query(text, params);
}
