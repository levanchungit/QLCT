import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { listAccounts } from "@/src/repos/accountRepo";
import { listCategories } from "@/src/repos/categoryRepo";
import {
  addExpense,
  addIncome,
  updateTransaction,
} from "@/src/repos/transactionRepo";
import { formatMoney } from "@/src/utils/format";

type Category = {
  id: string;
  name: string;
  color?: string;
  icon?: string; // "mi:wallet" | "mc:cash"
  type: "expense" | "income";
};

// Render icon linh hoạt theo prefix
const renderIcon = (packed: string | null | undefined, size = 28) => {
  const v = packed ?? "mi:help-outline";
  const [lib, name] = v.split(":");
  if (lib === "mc")
    return (
      <MaterialCommunityIcons name={name as any} size={size} color="#fff" />
    );
  return <MaterialIcons name={name as any} size={size} color="#fff" />;
};

const ChinhSuaGiaoDich = () => {
  // Nhận params để preselect khi chỉnh sửa
  const params = useLocalSearchParams();
  const { id, amount, detail, method, category, occurred_at } =
    (params as {
      id?: string;
      amount?: string | number;
      detail?: string;
      method?: string; // tên tài khoản
      category?: string; // tên danh mục
      occurred_at?: string | number; // epoch seconds
    }) ?? {};

  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");
  const [inputAmount, setInputAmount] = useState(amount ? String(amount) : "");
  const [inputDetail, setInputDetail] = useState(detail ? String(detail) : "");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  // Set ngày mặc định theo occurred_at nếu có
  const [selectedDate, setSelectedDate] = useState(
    typeof occurred_at !== "undefined"
      ? dayjs.unix(Number(occurred_at))
      : dayjs()
  );

  const [showAccountModal, setShowAccountModal] = useState(false);

  const today = dayjs();

  // Load tài khoản & danh mục
  useEffect(() => {
    (async () => {
      const accs = await listAccounts();
      const cats = await listCategories();
      setAccounts(accs);
      setCategories(cats);
    })();
  }, []);

  // Khi có accounts/categories + params => preselect
  useEffect(() => {
    if (!accounts.length || !categories.length) return;

    // Chọn tài khoản theo tên (method)
    if (method) {
      const acc = accounts.find((a) => a.name === method);
      if (acc) setSelectedAccount(acc);
    } else if (!selectedAccount && accounts.length) {
      setSelectedAccount(accounts[0]);
    }

    // Chọn danh mục theo tên (category) + set tab đúng type
    if (category) {
      const cat = categories.find((c) => c.name === category);
      if (cat) {
        setSelectedCategory(cat);
        setActiveTab(cat.type);
      }
    }
  }, [accounts, categories, method, category]);

  // ======= Lưu giao dịch (giữ nguyên hành vi add) =======
  const handleSaveTransaction = useCallback(async () => {
    const amt = parseInt((inputAmount ?? "").replace(/\D/g, ""), 10);
    if (!amt || amt <= 0) return Alert.alert("Lỗi", "Số tiền không hợp lệ");
    if (!selectedAccount) return Alert.alert("Lỗi", "Chưa chọn tài khoản");
    if (!selectedCategory) return Alert.alert("Lỗi", "Chưa chọn danh mục");

    const when = selectedDate.isValid() ? selectedDate.toDate() : new Date();
    console.log("object", {
      id: String(id),
      accountId: selectedAccount.id,
      categoryId: selectedCategory.id,
      type: activeTab, // "expense" | "income"
      amount: amt,
      note: inputDetail || null,
      when,
    });
    try {
      if (id) {
        // ✅ CHỈNH SỬA (UPDATE)
        await updateTransaction({
          id: String(id),
          accountId: selectedAccount.id,
          categoryId: selectedCategory.id,
          type: activeTab, // "expense" | "income"
          amount: amt,
          note: inputDetail || null,
          when,
        });
      } else {
        // ✅ TẠO MỚI (INSERT)
        const fn = activeTab === "expense" ? addExpense : addIncome;
        await fn({
          accountId: selectedAccount.id,
          categoryId: selectedCategory.id,
          amount: amt,
          note: inputDetail || null,
          when,
          updatedAt: new Date(), // tự set updated_at cho bản ghi mới
        });
      }
      router.back();
    } catch (e) {
      console.error("❌ Lỗi lưu giao dịch:", e);
      Alert.alert("Lỗi", "Không thể lưu giao dịch");
    }
  }, [
    id,
    inputAmount,
    inputDetail,
    selectedAccount,
    selectedCategory,
    activeTab,
    selectedDate,
  ]);

  const displayed = useMemo(
    () => categories.filter((c) => c.type === activeTab),
    [categories, activeTab]
  );
  const COLS = 3;
  const fillers = (COLS - (displayed.length % COLS)) % COLS;

  return (
    <View className="flex-1 bg-background">
      {/* HEADER */}
      <View className="bg-primary rounded-b-[40px] pb-6 pt-12">
        <View className="items-center">
          <TouchableOpacity
            className="absolute left-4 top-3"
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={25} color="white" />
          </TouchableOpacity>
          <Text className="text-center text-xl text-white font-bold">
            {id ? "Chỉnh sửa giao dịch" : "Tạo giao dịch"}
          </Text>
        </View>

        {/* Tabs */}
        <View className="mt-6 px-4">
          <View className="flex-row w-full justify-around">
            {[
              { key: "expense", label: "CHI PHÍ" },
              { key: "income", label: "THU NHẬP" },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => {
                  setActiveTab(tab.key as any);
                  // Nếu chuyển tab khác, bỏ chọn category để tránh mismatch
                  setSelectedCategory(null);
                }}
                className={`border-b-2 ${
                  activeTab === tab.key ? "border-white" : "border-transparent"
                }`}
              >
                <Text
                  className={`px-6 py-1 font-bold ${
                    activeTab === tab.key ? "text-white" : "text-gray-200"
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* BODY */}
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
      >
        {/* SỐ TIỀN */}
        <View className="flex-row justify-center items-center gap-4">
          <View className="w-[50%] max-w-[50%]">
            <TextInput
              className="text-black text-center text-2xl border-b-2 border-b-gray-400"
              keyboardType="numeric"
              value={inputAmount ?? ""}
              onChangeText={(t) => setInputAmount(t ?? "")}
              placeholder="Nhập số tiền"
              style={{ paddingBottom: 0 }}
            />
          </View>
          <Text className="text-primary text-2xl">VND</Text>
          <TouchableOpacity onPress={() => console.log("calculator")}>
            <MaterialIcons name="calculate" size={40} color="green" />
          </TouchableOpacity>
        </View>

        {/* TÀI KHOẢN */}
        <View className="mt-4 gap-2">
          <TouchableOpacity
            className="mt-6"
            onPress={() => setShowAccountModal(true)}
          >
            <Text className="text-text text-sm">Tài khoản</Text>
            {selectedAccount ? (
              <View className="flex-row items-center mt-1">
                <View
                  className="w-8 h-8 rounded-full items-center justify-center mr-2"
                  style={{
                    backgroundColor: selectedAccount.color ?? "#10B981",
                  }}
                >
                  {renderIcon(selectedAccount.icon ?? "mi:account-balance", 20)}
                </View>
                <Text className="text-lg text-black">
                  {selectedAccount.name}
                </Text>
              </View>
            ) : (
              <Text className="text-red-500 text-sm">Chưa chọn tài khoản</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* DANH MỤC */}
        <View className="mt-4 gap-2">
          <Text className="text-text text-sm">Danh mục</Text>
          {!selectedCategory && (
            <Text className="text-red-600 text-sm">
              Bạn phải chọn một danh mục
            </Text>
          )}

          <View className="flex-row flex-wrap justify-center gap-x-6 gap-y-5 mt-2">
            {displayed.map((cat) => {
              const isSelected = selectedCategory?.id === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.9}
                  className={`w-[28%] items-center mb-5 p-2 ${
                    isSelected ? "bg-[#63B3ED] rounded-2xl" : "bg-transparent"
                  }`}
                  style={{
                    shadowColor: "#000",
                    shadowOpacity: isSelected ? 0.12 : 0,
                    shadowRadius: isSelected ? 6 : 0,
                    shadowOffset: { width: 0, height: 3 },
                    elevation: isSelected ? 3 : 0,
                  }}
                >
                  <View
                    className="w-16 h-16 rounded-full justify-center items-center bg-transparent"
                    style={{
                      backgroundColor: isSelected
                        ? "transparent"
                        : (cat.color ?? "#7EC5E8"),
                    }}
                  >
                    {renderIcon(cat.icon, 28)}
                  </View>

                  <Text
                    className={`mt-2 text-[13px] font-semibold text-center ${
                      isSelected ? "text-white" : "text-black"
                    }`}
                    numberOfLines={2}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {Array.from({ length: fillers }).map((_, i) => (
              <View
                key={`spacer-${i}`}
                className="w-[28%] mb-5"
                style={{ opacity: 0 }}
              />
            ))}
          </View>
        </View>

        {/* CHỌN NGÀY */}
        <View className="mt-2 flex-row items-center justify-between">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ columnGap: 16 }}
          >
            {[
              { d: today, label: "hôm nay" },
              { d: today.subtract(1, "day"), label: "hôm qua" },
              { d: today.subtract(2, "day"), label: "hai ngày trước" },
              { d: today.subtract(3, "day"), label: "ba ngày trước" },
              { d: today.subtract(4, "day"), label: "bốn ngày trước" },
            ].map((item) => {
              const isSelected = item.d.isSame(selectedDate, "day");
              return (
                <TouchableOpacity
                  key={item.d.format("YYYY-MM-DD")}
                  onPress={() => setSelectedDate(item.d)}
                  className={`items-center rounded-lg px-2 py-1 ${
                    isSelected ? "bg-primary" : ""
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      isSelected ? "text-white" : "text-black"
                    }`}
                  >
                    {item.d.format("DD/MM")}
                  </Text>
                  <Text
                    className={`text-xs ${
                      isSelected ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity onPress={() => console.log("Mở lịch")}>
            <MaterialIcons name="calendar-today" size={28} color="green" />
          </TouchableOpacity>
        </View>

        {/* GHI CHÚ */}
        <View className="mt-4">
          <Text className="text-text text-sm">Ghi chú</Text>
          <TextInput
            className="text-black border-b-2"
            value={inputDetail ?? ""}
            onChangeText={(t) => setInputDetail(t ?? "")}
            placeholder="Nhập ghi chú"
            maxLength={4096}
          />
          <Text className="text-right text-text">
            {(inputDetail ?? "").length}/4096
          </Text>
        </View>

        {/* Ảnh */}
        <View className="mt-2">
          <View>
            <Text className="text-text text-sm">Ảnh</Text>
          </View>
          <View className="flex-wrap flex-row gap-2 mt-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <TouchableOpacity
                key={index}
                className="w-[31%] items-center justify-center"
                onPress={() => console.log("Add", index)}
              >
                <View className="w-20 h-20 rounded-xl justify-center items-center bg-gray-400">
                  <MaterialIcons name="add" size={40} color="white" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* NÚT LƯU */}
      <View className="justify-center items-center">
        <TouchableOpacity
          onPress={handleSaveTransaction}
          className="absolute bottom-12 w-[70%] bg-button rounded-full p-4 shadow-lg"
        >
          <Text className="text-center text-black font-semibold">Lưu</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL CHỌN TÀI KHOẢN */}
      <Modal visible={showAccountModal} animationType="fade" transparent>
        <Pressable
          className="flex-1 bg-black/40"
          onPress={() => setShowAccountModal(false)}
        />
        <View className="absolute inset-0 items-center justify-center px-6">
          <View className="w-full rounded-2xl bg-white p-4">
            <Text className="text-base font-semibold text-black mb-2">
              Chọn tài khoản
            </Text>
            {accounts.map((acc) => (
              <TouchableOpacity
                key={acc.id}
                onPress={() => {
                  setSelectedAccount(acc);
                  setShowAccountModal(false);
                }}
                className="flex-row items-center py-2"
              >
                <View
                  className="w-8 h-8 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: acc.color ?? "#22C55E" }}
                >
                  <MaterialIcons
                    name={(acc.icon as any) ?? "account-balance"}
                    size={20}
                    color="#fff"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-black text-base">{acc.name}</Text>
                  <Text className="text-gray-500 text-xs">
                    {formatMoney(acc.balance_cached)} VND
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            <View className="mt-2 flex-row justify-end">
              <TouchableOpacity onPress={() => setShowAccountModal(false)}>
                <Text className="font-bold" style={{ color: "#10B981" }}>
                  HỦY
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ChinhSuaGiaoDich;
