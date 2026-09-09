import { Pool, QueryResultRow } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var lscmPool: Pool | undefined;
}

export const pool =
  global.lscmPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  });

if (process.env.NODE_ENV !== 'production') global.lscmPool = pool;

export function query<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []) {
  return pool.query<T>(text, values);
}