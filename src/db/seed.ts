import type { SQLiteDatabase } from "expo-sqlite";
import { openDb } from ".";

type TxType = "expense" | "income";

export async function seedIfEmpty(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ c: number }>(
    "SELECT COUNT(*) c FROM accounts"
  );
  if ((row?.c ?? 0) > 0) return;

  await db.execAsync("BEGIN");
  try {
    await db.runAsync("INSERT INTO users(id,name) VALUES('u_demo','Me')");

    await db.runAsync(`INSERT INTO accounts(id,user_id,name,icon,color,include_in_total,balance_cached)
      VALUES('acc_wallet','u_demo','Wallet','wallet','red',1,12000)`);
    await db.runAsync(`INSERT INTO accounts(id,user_id,name,icon,color,include_in_total,balance_cached)
      VALUES('acc_bank','u_demo','Bank','bank','green',1,3210000000)`);

    await db.runAsync(`INSERT INTO categories(id,user_id,name,type,icon,color)
      VALUES('cat_4g','u_demo','4G','expense','wifi','#2ca9ff')`);
    await db.runAsync(`INSERT INTO categories(id,user_id,name,type,icon,color)
      VALUES('cat_salary','u_demo','Phiếu lương','income','banknote','#2563eb')`);

    const now = Math.floor(Date.now() / 1000);
    await db.runAsync(
      `INSERT INTO transactions(id,user_id,account_id,category_id,type,amount,note,occurred_at)
      VALUES('tx_1','u_demo','acc_bank','cat_4g','expense',150000,'Mạng 5g Viettel',?)`,
      [now]
    );

    await db.execAsync("COMMIT");
  } catch (e) {
    await db.execAsync("ROLLBACK");
    throw e;
  }
}

export async function seedSampleMonth({
  year,
  month,
}: {
  year: number;
  month: number;
}) {
  const db = await openDb();

  // Dùng cờ trong settings để không seed trùng
  const key = `seed_${year}_${month + 1}`;
  const hit = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM settings WHERE key=?",
    [key]
  );
  if (hit?.value === "done") return; // đã seed rồi thì thôi

  const userId = "u_demo";
  const ensure = async () => {
    // Tạo user/accounts/categories nếu thiếu
    await db.runAsync(
      "INSERT OR IGNORE INTO users(id,name) VALUES('u_demo','Me')"
    );
    await db.runAsync(
      `INSERT OR IGNORE INTO accounts(id,user_id,name,icon,color,include_in_total,balance_cached)
       VALUES ('acc_wallet',?,'Wallet','wallet','red',1,0)`,
      [userId]
    );
    await db.runAsync(
      `INSERT OR IGNORE INTO accounts(id,user_id,name,icon,color,include_in_total,balance_cached)
       VALUES ('acc_bank',?,'Bank','bank','green',1,0)`,
      [userId]
    );
    const cats: [string, string, "expense" | "income", string, string][] = [
      ["cat_4g", "4G", "expense", "wifi", "#2ca9ff"],
      ["cat_electric", "Điện", "expense", "bolt", "#8dd1e1"],
      ["cat_grocery", "Tạp phẩm", "expense", "cart", "#82ca9d"],
      ["cat_party", "Đám tiệc", "expense", "emoji-events", "#fb7185"],
      ["cat_salary", "Phiếu lương", "income", "banknote", "#2563eb"],
    ];
    for (const [id, name, type, icon, color] of cats) {
      await db.runAsync(
        `INSERT OR IGNORE INTO categories(id,user_id,name,type,icon,color) VALUES(?,?,?,?,?,?)`,
        [id, userId, name, type, icon, color]
      );
    }
  };

  const addTx = async (
    day: number,
    catId: string,
    type: TxType,
    amount: number,
    note: string,
    accountId = "acc_bank"
  ) => {
    const occurred = new Date(year, month, day); // month: 0=Jan ... 9=Oct
    const occurred_at = Math.floor(occurred.getTime() / 1000);
    const id = `tx_${Math.random().toString(36).slice(2)}`;
    await db.runAsync(
      `INSERT INTO transactions(id,user_id,account_id,category_id,type,amount,note,occurred_at)
       VALUES(?,?,?,?,?,?,?,?)`,
      [id, userId, accountId, catId, type, amount, note, occurred_at]
    );
  };

  await db.execAsync("BEGIN");
  try {
    await ensure();

    // === Ví dụ data mẫu cho tháng chỉ định ===
    // Thu nhập
    await addTx(1, "cat_salary", "income", 15_000_000, "Lương tháng");
    await addTx(15, "cat_salary", "income", 500_000, "Bonus");

    // Chi phí
    await addTx(2, "cat_4g", "expense", 150_000, "Đóng cước Viettel");
    await addTx(5, "cat_electric", "expense", 320_000, "Tiền điện");
    await addTx(6, "cat_grocery", "expense", 450_000, "Siêu thị");
    await addTx(7, "cat_party", "expense", 1_000_000, "Đám cưới bạn");
    await addTx(10, "cat_grocery", "expense", 180_000, "Đồ ăn vặt");
    await addTx(12, "cat_4g", "expense", 120_000, "Gói data 4G");
    await addTx(18, "cat_party", "expense", 600_000, "Liên hoan công ty");
    await addTx(20, "cat_electric", "expense", 310_000, "Điện tháng");
    await addTx(25, "cat_grocery", "expense", 700_000, "Đi chợ tuần");
    await addTx(27, "cat_4g", "expense", 150_000, "Gia hạn 5G");
    await addTx(29, "cat_party", "expense", 300_000, "Sinh nhật bạn");

    await db.runAsync(
      "INSERT OR REPLACE INTO settings(key,value) VALUES(?, 'done')",
      [key]
    );
    await db.execAsync("COMMIT");
  } catch (e) {
    await db.execAsync("ROLLBACK");
    throw e;
  }
}
