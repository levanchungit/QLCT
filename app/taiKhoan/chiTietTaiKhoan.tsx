import HeaderMenu from "@/components/HeaderMenu";
import {
  countAccounts,
  createAccount,
  deleteAccount,
  getAccountById,
  isDefaultAccount,
  updateAccount,
} from "@/src/repos/accountRepo";
import {
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const ICON_SIZE = 22;

// LƯU Ý: mỗi option có lib + name
const iconOptions = [
  // 💰 Tài chính chung
  { key: "wallet", lib: "mc", name: "wallet" },
  { key: "bank", lib: "mi", name: "account-balance" },
  { key: "card", lib: "mc", name: "credit-card" },
  { key: "piggy", lib: "mc", name: "piggy-bank-outline" },
  { key: "cash", lib: "mc", name: "cash" },
  { key: "atm", lib: "mc", name: "atm" },
  { key: "safe", lib: "mc", name: "safe" },
  { key: "briefcase", lib: "mc", name: "briefcase" },
  { key: "bank2", lib: "mi", name: "account-balance-wallet" },

  // 💳 Thanh toán / giao dịch
  { key: "transfer", lib: "mi", name: "sync-alt" },
  { key: "paypal", lib: "fa5", name: "paypal" },
  { key: "banknote", lib: "mc", name: "bank" },

  // 🌍 Quốc tế / đa tài khoản
  { key: "globe", lib: "mc", name: "earth" },
  { key: "travel", lib: "mc", name: "airplane" },
  { key: "gift", lib: "mc", name: "gift" },

  // 🏠 Cá nhân / khác
  { key: "home", lib: "mc", name: "home-outline" },
  { key: "family", lib: "fa5", name: "users" },
  { key: "shopping", lib: "mc", name: "cart-outline" },
  { key: "salary", lib: "fa5", name: "money-check-alt" },
  { key: "school", lib: "mc", name: "school-outline" },
] as const;

const palette = [
  "#F43F5E",
  "#EF4444",
  "#F59E0B",
  "#EAB308",
  "#22C55E",
  "#3B82F6",
  "#60A5FA",
];

// ===== helpers để pack/unpack icon =====
const packIcon = (lib: string, name: string) => `${lib}:${name}`;
const normalizeIcon = (raw?: string | string[]) => {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v) return "mc:wallet";
  // Nếu dữ liệu cũ lưu chỉ là "wallet" → mặc định là mc
  return v.includes(":") ? v : `mc:${v}`;
};

export default function ChiTietTaiKhoan() {
  const p = useLocalSearchParams<{
    id?: string;
    name?: string;
    amount?: string;
    color?: string;
    icon?: string;
  }>();

  const editingId = useMemo(
    () => (Array.isArray(p.id) ? p.id[0] : p.id),
    [p.id]
  );

  // state
  const [inputAmount, setInputAmount] = useState<string>(
    Array.isArray(p.amount) ? (p.amount[0] ?? "") : (p.amount ?? "")
  );
  const [inputName, setInputName] = useState<string>(
    Array.isArray(p.name) ? (p.name[0] ?? "") : (p.name ?? "")
  );
  const [selectedIcon, setSelectedIcon] = useState<string>(
    normalizeIcon(p.icon)
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    Array.isArray(p.color)
      ? (p.color[0] ?? palette[1])
      : (p.color ?? palette[1])
  );
  const [exclude, setExclude] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);
  const [errorName, setErrorName] = useState(false);

  // NEW: kiểm soát nút xoá
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    (async () => {
      if (!editingId) {
        setCanDelete(false);
        return;
      }
      const row = await getAccountById(editingId);
      if (!row) return;
      setInputName(row.name ?? "");
      setSelectedIcon(normalizeIcon(row.icon ?? undefined));
      setSelectedColor(row.color ?? palette[1]);
      setExclude(row.include_in_total === 0);
      setInputAmount(String(row.balance_cached ?? 0));

      // quyết định có cho xoá không:
      const isDef = await isDefaultAccount(editingId);
      const total = await countAccounts();
      setCanDelete(!isDef && total > 1); // không xoá default và không xoá nếu chỉ còn 1 tài khoản
    })();
  }, [editingId]);

  const renderIconByLib = (lib: string, name: string, color: string) => {
    if (lib === "mc")
      return (
        <MaterialCommunityIcons
          name={name as any}
          size={ICON_SIZE}
          color={color}
        />
      );
    if (lib === "fa5")
      return <FontAwesome5 name={name as any} size={ICON_SIZE} color={color} />;
    return <MaterialIcons name={name as any} size={ICON_SIZE} color={color} />;
  };

  const onSave = async () => {
    if (saving) return;
    const name = inputName.trim();
    const balance = Math.max(
      0,
      parseInt((inputAmount || "0").replace(/\D/g, ""), 10) || 0
    );

    if (!name) {
      setErrorName(true); // báo lỗi
      return;
    }

    setErrorName(false); // clear lỗi nếu nhập hợp lệ

    try {
      setSaving(true);
      if (editingId) {
        await updateAccount(editingId, {
          name,
          icon: selectedIcon,
          color: selectedColor,
          includeInTotal: !exclude,
          balance,
        });
      } else {
        await createAccount({
          name,
          icon: selectedIcon,
          color: selectedColor,
          includeInTotal: !exclude,
          balance,
        });
      }
      router.back();
    } finally {
      setSaving(false);
    }
  };

  // NEW: xác nhận và xoá
  const onDeletePress = () => {
    if (!editingId) return;
    Alert.alert(
      "Xoá tài khoản",
      "Hành động này không thể hoàn tác. Bạn có chắc muốn xoá?",
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: async () => {
            try {
              setSaving(true);
              await deleteAccount(editingId);
              router.back();
            } catch (e: any) {
              if (e?.code === "DEFAULT_ACCOUNT") {
                Alert.alert(
                  "Không thể xoá",
                  "Đây là tài khoản mặc định, không thể xoá."
                );
              } else if (e?.code === "LAST_ACCOUNT") {
                Alert.alert("Không thể xoá", "Phải còn ít nhất 1 tài khoản.");
              } else {
                Alert.alert(
                  "Lỗi",
                  "Không xoá được tài khoản. Vui lòng thử lại."
                );
              }
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-background">
      <HeaderMenu
        title={editingId ? "Sửa tài khoản" : "Tạo tài khoản"}
        backgroundColor="bg-primary"
        icon="arrow-back"
        height="h-[90px]"
        paddingTop="pt-[30px]"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: editingId ? 140 : 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Số dư ban đầu */}
          <View className="mt-6 px-5 flex-row justify-center items-center">
            <View className="w-1/2 border-b border-gray-300 items-center">
              <TextInput
                value={inputAmount}
                onChangeText={setInputAmount}
                keyboardType="numeric"
                placeholder="0"
                textAlign="center" // 👈 căn giữa chữ trong input
                className="text-4xl font-semibold text-gray-800 w-full py-1"
              />
            </View>
            <Text className="ml-2 text-gray-600 text-2xl font-medium">VND</Text>
          </View>

          {/* Tên tài khoản */}
          <View className="mt-5 px-5">
            <Text className="text-gray-500 mb-1">Tên tài khoản</Text>
            <TextInput
              value={inputName}
              onChangeText={(text) => {
                setInputName(text);
                if (text.trim() !== "") setErrorName(false); // clear lỗi khi người dùng gõ lại
              }}
              className={`border-b pb-2 text-gray-800 ${
                errorName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Nhập tên"
              placeholderTextColor="#9CA3AF"
            />
            {errorName && (
              <Text className="text-red-500 mt-1 text-sm">
                Vui lòng nhập tên tài khoản
              </Text>
            )}
          </View>

          {/* Biểu tượng */}
          <View className="mt-6 px-5">
            <Text className="text-gray-500 mb-2">Biểu tượng</Text>

            <View className="flex-row flex-wrap">
              {iconOptions.map((opt) => {
                const value = packIcon(opt.lib, opt.name); // "<lib>:<name>"
                const active = selectedIcon === value;

                return (
                  <TouchableOpacity
                    key={`${opt.lib}:${opt.name}`} // ✅ đúng cú pháp
                    activeOpacity={0.85}
                    onPress={() => setSelectedIcon(value)}
                    className="w-1/5 items-center my-2"
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <View
                      className="w-14 h-14 rounded-full items-center justify-center relative"
                      style={{
                        backgroundColor: active ? selectedColor : "transparent",
                        borderWidth: 2,
                        borderColor: active ? selectedColor : "#9FB4A9",
                        elevation: active ? 3 : 0,
                      }}
                    >
                      {renderIconByLib(
                        opt.lib,
                        opt.name,
                        active ? "#fff" : "#9FB4A9"
                      )}

                      {active ? (
                        <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full items-center justify-center">
                          <MaterialIcons
                            name="check-circle"
                            size={16}
                            color={selectedColor}
                          />
                        </View>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          {/* Màu sắc */}
          <View className="mt-6 px-5">
            <Text className="text-gray-500 mb-2">Màu sắc</Text>
            <View className="flex-row items-center gap-3 flex-wrap">
              {palette.map((c) => {
                const active = selectedColor === c;
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setSelectedColor(c)}
                    activeOpacity={0.8}
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: c }}
                  >
                    {active ? (
                      <MaterialIcons name="check" size={18} color="#fff" />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                activeOpacity={0.7}
                className="w-8 h-8 rounded-full border border-gray-300 items-center justify-center"
              >
                <MaterialIcons name="add" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Nút Lưu + (có thể) Xoá */}
      <SafeAreaView className="absolute left-0 right-0 bottom-0">
        <View className="items-center pb-3">
          <TouchableOpacity
            activeOpacity={0.85}
            className="w-11/12 rounded-full bg-[#FFC107] py-3 items-center justify-center shadow-lg"
            onPress={onSave}
            disabled={saving}
          >
            <Text className="text-base font-semibold text-[#1F2937]">
              {saving ? "Đang lưu..." : "Lưu"}
            </Text>
          </TouchableOpacity>

          {editingId && canDelete ? (
            <TouchableOpacity
              activeOpacity={0.85}
              className="w-11/12 rounded-full border border-red-500 py-3 items-center justify-center mt-3"
              onPress={onDeletePress}
              disabled={saving}
            >
              <Text className="text-base font-semibold text-red-600">
                Xoá tài khoản
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
}
