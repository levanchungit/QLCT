import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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
import { addExpense, addIncome } from "@/src/repos/transactionRepo";
import { formatMoney } from "@/src/utils/format";

type IconLib = "mi" | "mc";
type Category = {
  id: string;
  name: string;
  color?: string;
  icon?: string; // dạng "mi:wallet" hoặc "mc:cash"
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
  const { amount, detail } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");
  const [inputAmount, setInputAmount] = useState(amount ? String(amount) : "");
  const [inputDetail, setInputDetail] = useState(detail ? String(detail) : "");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const today = dayjs();
  const [selectedDate, setSelectedDate] = useState(today);

  const [showAccountModal, setShowAccountModal] = useState(false);

  const dates = useMemo(
    () => [
      { d: today, label: "hôm nay" },
      { d: today.subtract(1, "day"), label: "hôm qua" },
      { d: today.subtract(2, "day"), label: "hai ngày trước" },
      { d: today.subtract(3, "day"), label: "ba ngày trước" },
      { d: today.subtract(4, "day"), label: "bốn ngày trước" },
    ],
    []
  );

  // Load tài khoản và danh mục
  useEffect(() => {
    (async () => {
      const accs = await listAccounts();
      setAccounts(accs);
      if (accs.length > 0) setSelectedAccount(accs[0]);
      const cats = await listCategories();
      setCategories(cats);
    })();
  }, []);

  // ======= Xử lý lưu giao dịch =======
  const handleSaveTransaction = async () => {
    const amt = parseInt((inputAmount ?? "").replace(/\D/g, ""), 10);
    if (!amt || amt <= 0) return Alert.alert("Lỗi", "Số tiền không hợp lệ");
    if (!selectedAccount) return Alert.alert("Lỗi", "Chưa chọn tài khoản");
    if (!selectedCategory) return Alert.alert("Lỗi", "Chưa chọn danh mục");

    const when = dayjs(selectedDate).isValid()
      ? selectedDate.toDate()
      : new Date();

    try {
      const fn = activeTab === "expense" ? addExpense : addIncome;
      await fn({
        accountId: selectedAccount.id,
        categoryId: selectedCategory.id,
        amount: amt,
        note: inputDetail || null,
        when,
      });
      router.replace("/main");
    } catch (e) {
      console.error("❌ Lỗi lưu giao dịch:", e);
      Alert.alert("Lỗi", "Không thể lưu giao dịch");
    }
  };

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
            {selectedCategory ? "Chỉnh sửa giao dịch" : "Tạo giao dịch"}
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
                onPress={() => setActiveTab(tab.key as any)}
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

          <View className="flex-row flex-wrap justify-between mt-2">
            {categories
              .filter((c) => c.type === activeTab)
              .map((cat) => {
                const isSelected = selectedCategory?.id === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    className="w-[30%] items-center mb-4"
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <View
                      className={`w-16 h-16 rounded-full justify-center items-center ${
                        isSelected ? "border-4 border-green-500" : ""
                      }`}
                      style={{ backgroundColor: cat.color ?? "#ccc" }}
                    >
                      {renderIcon(cat.icon, 28)}
                    </View>
                    <Text className="mt-1 text-black">{cat.name}</Text>
                  </TouchableOpacity>
                );
              })}
          </View>
        </View>
        {/* CHỌN NGÀY */}
        <View className="mt-2 flex-row items-center justify-between">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ columnGap: 16 }}
          >
            {dates.map((item) => {
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
