import { Pool, QueryResult, QueryResultRow } from 'pg';
import { env } from '../config/config';

const pool: Pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: any[],
): Promise<QueryResult<T>> {
  return pool.query(text, params);
}
