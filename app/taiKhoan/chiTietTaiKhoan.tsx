// app/chinhSuaTaiKhoan.tsx
import HeaderMenu from "@/components/HeaderMenu";
import {
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const ICON_SIZE = 22;

// Một số icon mẫu (bạn có thể thêm/bớt tuỳ ý)
const iconOptions = [
  { key: "wallet", lib: "mc", name: "wallet" },
  { key: "bank", lib: "mi", name: "account-balance" },
  { key: "card", lib: "mc", name: "credit-card" },
  { key: "piggy", lib: "mc", name: "piggy-bank-outline" },
  { key: "percent", lib: "fa5", name: "percent" },
  { key: "transfer", lib: "mi", name: "sync-alt" },
  { key: "dollar", lib: "fa5", name: "dollar-sign" },
  { key: "euro", lib: "fa5", name: "euro-sign" },
  { key: "yen", lib: "fa5", name: "yen-sign" },
  { key: "pound", lib: "fa5", name: "pound-sign" },
  { key: "btc", lib: "fa5", name: "bitcoin" },
  { key: "eth", lib: "mc", name: "ethereum" },
  { key: "usdt", lib: "mc", name: "currency-usd" },
  { key: "bsc", lib: "mc", name: "bitcoin" },
  { key: "chart", lib: "mc", name: "chart-line" },
  { key: "safe", lib: "mc", name: "safe-square-outline" },
  { key: "building", lib: "mi", name: "apartment" },
  { key: "saving", lib: "mc", name: "cash-multiple" },
  { key: "atm", lib: "mc", name: "bank-outline" },
  { key: "coin", lib: "mc", name: "circle-multiple-outline" },
  { key: "gift", lib: "mc", name: "gift-outline" },
  { key: "bag", lib: "mc", name: "bag-personal-outline" },
  { key: "shield", lib: "mc", name: "shield-outline" },
  { key: "key", lib: "mc", name: "key-outline" },
  { key: "tag", lib: "mc", name: "tag-outline" },
  { key: "note", lib: "mc", name: "note-outline" },
  { key: "receipt", lib: "mc", name: "file-document-outline" },
  { key: "bank2", lib: "mi", name: "account-balance-wallet" },
  { key: "cash", lib: "mc", name: "cash" },
  { key: "safe2", lib: "mc", name: "safe" },
];

const palette = [
  "#F43F5E",
  "#EF4444",
  "#F59E0B",
  "#EAB308",
  "#22C55E",
  "#3B82F6",
  "#60A5FA",
];

export default function ChiTietTaiKhoan() {
  const { id, name, amount, color, icon } = useLocalSearchParams();

  const insets = useSafeAreaInsets();
  const [inputAmount, setInputAmount] = useState<string>(
    amount?.toString() ?? ""
  );
  const [inputName, setInputName] = useState<string>(
    Array.isArray(name) ? (name[0] ?? "") : (name ?? "")
  );
  const [selectedIcon, setSelectedIcon] = useState<string>(
    Array.isArray(icon) ? (icon[0] ?? "") : (icon ?? "")
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    Array.isArray(color) ? (color[0] ?? "") : (color ?? "")
  );
  const [exclude, setExclude] = useState<boolean>(false);

  const renderIcon = (opt: (typeof iconOptions)[number], tint?: string) => {
    const color = tint ?? "#9FB4A9"; // xám xanh nhạt giống ảnh
    if (opt.lib === "mc")
      return (
        <MaterialCommunityIcons
          name={opt.name as any}
          size={ICON_SIZE}
          color={color}
        />
      );
    if (opt.lib === "fa5")
      return (
        <FontAwesome5 name={opt.name as any} size={ICON_SIZE} color={color} />
      );
    return (
      <MaterialIcons name={opt.name as any} size={ICON_SIZE} color={color} />
    );
  };

  return (
    <View className="flex-1 bg-background">
      <HeaderMenu
        title={name.toString()}
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
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Amount + Currency */}
          <View className="mt-3 px-5">
            <View className="flex-row items-end border-b border-gray-300 pb-2">
              <TextInput
                value={inputAmount}
                onChangeText={setInputAmount}
                keyboardType="numeric"
                placeholder="0"
                className="flex-1 text-3xl font-semibold text-gray-800"
              />
              <Text className="ml-3 text-gray-600 text-base">VND</Text>
            </View>
          </View>

          {/* Tên tài khoản */}
          <View className="mt-5 px-5">
            <Text className="text-gray-500 mb-1">Tên tài khoản</Text>
            <TextInput
              value={inputName}
              onChangeText={setInputName}
              className="border-b border-gray-300 pb-2 text-gray-800"
              placeholder="Nhập tên"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Biểu tượng */}
          <View className="mt-6 px-5">
            <Text className="text-gray-500 mb-2">Biểu tượng</Text>

            <View className="flex-row flex-wrap">
              {iconOptions.map((opt) => {
                const active = selectedIcon === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    activeOpacity={0.8}
                    onPress={() => setSelectedIcon(opt.key)}
                    className="w-1/5 items-center my-2"
                  >
                    <View
                      className={`w-14 h-14 rounded-full items-center justify-center`}
                      style={{
                        backgroundColor: active ? selectedColor : "transparent",
                        borderWidth: 2,
                        borderColor: "#9FB4A9",
                        shadowColor: active ? "#000" : "transparent",
                        shadowOpacity: active ? 0.15 : 0,
                        shadowRadius: active ? 8 : 0,
                        elevation: active ? 3 : 0,
                      }}
                    >
                      {renderIcon(opt, active ? "#fff" : "#9FB4A9")}
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

              {/* nút + */}
              <TouchableOpacity
                activeOpacity={0.7}
                className="w-8 h-8 rounded-full border border-gray-300 items-center justify-center"
              >
                <MaterialIcons name="add" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Exclude toggle */}
          <View className="mt-6 px-5 flex-row items-center justify-between">
            <Text className="text-gray-600">
              Không bao gồm trong tổng số dư
            </Text>
            <Switch
              value={exclude}
              onValueChange={setExclude}
              thumbColor={exclude ? "#fff" : "#f4f3f4"}
              trackColor={{ false: "#D1D5DB", true: "#6DA187" }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Nút Lưu cố định dưới đáy */}
      <SafeAreaView className="absolute left-0 right-0 bottom-0">
        <View className="items-center pb-3">
          <TouchableOpacity
            activeOpacity={0.85}
            className="w-11/12 rounded-full bg-[#FFC107] py-3 items-center justify-center shadow-lg"
            onPress={() => {
              // TODO: lưu dữ liệu
              router.back();
            }}
          >
            <Text className="text-base font-semibold text-[#1F2937]">Lưu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
