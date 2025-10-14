import { db, openDb } from "../db";

export async function totalInRange(
  startSec: number,
  endSec: number,
  type: "expense" | "income"
) {
  await openDb();
  const row = await db.getFirstAsync<{ sum: number }>(
    `SELECT COALESCE(SUM(amount),0) AS sum
     FROM transactions
     WHERE user_id='u_demo' AND type=? AND occurred_at>=? AND occurred_at<?`,
    [type, startSec, endSec]
  );
  return row?.sum ?? 0;
}

export async function categoryBreakdown(
  startSec: number,
  endSec: number,
  type: "expense" | "income"
) {
  await openDb();
  return db.getAllAsync<{
    category_id: string | null;
    name: string | null;
    color: string | null;
    icon: string | null;
    total: number;
  }>(
    `
    SELECT c.id AS category_id, c.name, c.color, c.icon,
           SUM(t.amount) AS total
    FROM transactions t
    LEFT JOIN categories c ON c.id = t.category_id
    WHERE t.user_id='u_demo'
      AND t.type=?
      AND t.occurred_at>=? AND t.occurred_at<?
    GROUP BY c.id
    HAVING total IS NOT NULL
    ORDER BY total DESC
  `,
    [type, startSec, endSec]
  );
}

export async function seedSampleMonthRandom({
  year,
  month,
  count = 20, // số giao dịch muốn thêm
}: {
  year: number;
  month: number;
  count?: number;
}) {
  const db = await openDb();
  const userId = "u_demo";
  const accountId = "acc_bank";

  // danh mục mẫu
  const categories = [
    { id: "cat_4g", type: "expense", label: "4G" },
    { id: "cat_electric", type: "expense", label: "Điện" },
    { id: "cat_grocery", type: "expense", label: "Tạp phẩm" },
    { id: "cat_party", type: "expense", label: "Đám tiệc" },
    { id: "cat_salary", type: "income", label: "Lương" },
  ];

  await db.execAsync("BEGIN");
  try {
    const rand = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    for (let i = 0; i < count; i++) {
      const cat = categories[rand(0, categories.length - 1)];
      const day = rand(1, 28); // ngày 1-28 để an toàn
      const amount =
        cat.type === "income"
          ? rand(2_000_000, 15_000_000)
          : rand(50_000, 900_000);

      const note =
        cat.type === "income"
          ? `Nhận ${cat.label} (${day}/${month + 1})`
          : `Chi ${cat.label} (${day}/${month + 1})`;

      const occurred_at = Math.floor(
        new Date(year, month, day).getTime() / 1000
      );
      const id = `tx_${Math.random().toString(36).slice(2, 8)}`;

      await db.runAsync(
        `INSERT INTO transactions(id,user_id,account_id,category_id,type,amount,note,occurred_at)
         VALUES(?,?,?,?,?,?,?,?)`,
        [id, userId, accountId, cat.id, cat.type, amount, note, occurred_at]
      );
    }

    await db.execAsync("COMMIT");
    console.log(
      `✅ Seed random ${count} giao dịch tháng ${month + 1}/${year} thành công`
    );
  } catch (e) {
    await db.execAsync("ROLLBACK");
    console.error("❌ Seed random lỗi:", e);
  }
}
export async function addExpense({
  accountId,
  categoryId,
  amount,
  note,
  when,
}: {
  accountId: string;
  categoryId: string;
  amount: number;
  note?: string;
  when: Date;
}) {
  await openDb();
  const id = `tx_${Math.random().toString(36).slice(2)}`;
  const t = Math.floor(when.getTime() / 1000);
  await db.runAsync(
    `INSERT INTO transactions(id,user_id,account_id,category_id,type,amount,note,occurred_at)
     VALUES(?,?,?,?,?,?,?,?)`,
    [id, "u_demo", accountId, categoryId, "expense", amount, note ?? null, t]
  );
  return id;
}

export async function listByDay(day: Date) {
  await openDb();
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const s = Math.floor(start.getTime() / 1000);
  const e = s + 86400;
  return db.getAllAsync<any>(
    `
    SELECT t.*, a.name account_name, c.name category_name, c.icon category_icon
    FROM transactions t
    JOIN accounts a ON a.id=t.account_id
    LEFT JOIN categories c ON c.id=t.category_id
    WHERE t.user_id='u_demo' AND t.occurred_at>=? AND t.occurred_at<?
    ORDER BY t.occurred_at DESC
  `,
    [s, e]
  );
}
