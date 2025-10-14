import { db, openDb } from "../db";

export type Account = {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  balance_cached: number;
  include_in_total: 0 | 1;
};

export async function listAccounts(): Promise<Account[]> {
  await openDb();
  return db.getAllAsync<Account>(
    "SELECT id,name,icon,color,balance_cached,include_in_total FROM accounts ORDER BY name"
  );
}
