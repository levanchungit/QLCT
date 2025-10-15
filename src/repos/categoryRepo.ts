import { openDb } from "@/src/db";

export type Category = {
  id: string;
  name: string;
  icon?: string | null; // "mci:gift-outline"
  color?: string | null;
};

const genId = () => "cat_" + Math.random().toString(36).slice(2, 10);

export async function listCategories(): Promise<Category[]> {
  const db = await openDb();
  return db.getAllAsync<Category>(
    `SELECT id, name, icon, color
     FROM categories
     ORDER BY name ASC`
  );
}

export async function getCategoryById(id: string) {
  const db = await openDb();
  return db.getFirstAsync<Category>(
    `SELECT id, name, icon, color
     FROM categories WHERE id=?`,
    [id]
  );
}

export async function createCategory(input: {
  name: string;
  icon?: string | null;
  color?: string | null;
}) {
  const db = await openDb();
  const id = genId();
  await db.runAsync(
    `INSERT INTO categories(id,user_id,name,icon,color,created_at,updated_at)
     VALUES(?,?,?,?,?, strftime('%s','now'), strftime('%s','now'))`,
    [id, "u_demo", input.name.trim(), input.icon ?? null, input.color ?? null]
  );
  return id;
}

export async function updateCategory(
  id: string,
  input: { name?: string; icon?: string | null; color?: string | null }
) {
  const db = await openDb();
  const set: string[] = [];
  const vals: any[] = [];

  if (input.name != null) {
    set.push("name=?");
    vals.push(input.name.trim());
  }
  if (input.icon !== undefined) {
    set.push("icon=?");
    vals.push(input.icon ?? null);
  }
  if (input.color !== undefined) {
    set.push("color=?");
    vals.push(input.color ?? null);
  }
  set.push("updated_at=strftime('%s','now')");

  await db.runAsync(`UPDATE categories SET ${set.join(",")} WHERE id=?`, [
    ...vals,
    id,
  ]);
}

export async function deleteCategory(id: string) {
  const db = await openDb();
  await db.runAsync(`DELETE FROM categories WHERE id=?`, [id]);
}

// (tuỳ chọn) seed dữ liệu mẫu theo UI bạn gửi
export async function seedCategoryDefaults() {
  const db = await openDb();
  const count = await db.getFirstAsync<{ c: number }>(
    "SELECT COUNT(*) as c FROM categories"
  );
  if ((count?.c ?? 0) > 0) return;

  const defaults: { name: string; icon: string; color: string }[] = [
    { name: "Trả nợ", icon: "mci:help-circle-outline", color: "#7EC5E8" },
    { name: "Điện", icon: "mci:file-document-outline", color: "#66C2A3" },
    { name: "Wifi", icon: "mci:wifi", color: "#3A78D0" },
    { name: "4G", icon: "mci:web", color: "#7EC5E8" },
    { name: "Đám tiệc", icon: "mci:party-popper", color: "#EE4DB4" },
    {
      name: "Mỹ phẩm chăm sóc",
      icon: "mci:bottle-tonic-outline",
      color: "#F6C33E",
    },
    { name: "Hớt tóc", icon: "mci:content-cut", color: "#7AC15B" },
    { name: "Tiết kiệm", icon: "mci:piggy-bank-outline", color: "#F6C33E" },
    { name: "Khác", icon: "mci:help", color: "#E84A3C" },
    { name: "Tạp phẩm", icon: "mci:basket-outline", color: "#7EC5E8" },
    { name: "Di chuyển", icon: "mci:car-outline", color: "#3A78D0" },
    { name: "Giáo dục", icon: "mci:school-outline", color: "#EE4DB4" },
    { name: "Giải trí", icon: "mci:wallet-outline", color: "#7AC15B" },
    { name: "Sức khỏe", icon: "mci:heart-outline", color: "#E84A3C" },
    { name: "Tập thể dục", icon: "mci:arm-flex-outline", color: "#7FBF5B" },
    { name: "Gia đình", icon: "mci:account-group-outline", color: "#E84A3C" },
    { name: "Cafe", icon: "mci:silverware-fork-knife", color: "#F6C33E" },
    { name: "Trang chủ", icon: "mci:home-outline", color: "#3A78D0" },
    { name: "Quà tặng", icon: "mci:gift-outline", color: "#7AC15B" },
  ];

  for (const d of defaults) {
    await createCategory(d);
  }
}
