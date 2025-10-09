import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import type { IconProps } from "@expo/vector-icons/build/createIconSet";
type MaterialIconName = IconProps<keyof typeof MaterialIcons.glyphMap>["name"];

const dataDanhMuc: { name: string; icon: MaterialIconName; color: string }[] = [
  { name: "4G", icon: "sim-card", color: "#FFA500" },
  { name: "Trả nợ", icon: "money-off", color: "#FF4500" },
  { name: "Điện", icon: "flash-on", color: "#FBBF24" },
  { name: "Wifi", icon: "wifi", color: "#10B981" },
  { name: "Đám tiệc", icon: "celebration", color: "#8B5CF6" },
  { name: "Sức khỏe", icon: "health-and-safety", color: "#EF4444" },
  { name: "Ăn uống", icon: "restaurant", color: "#FB7185" },
  { name: "Xăng xe", icon: "local-gas-station", color: "#22D3EE" },
  { name: "Mua sắm", icon: "shopping-bag", color: "#F59E0B" },
  { name: "Mua sắm", icon: "shopping-bag", color: "#F59E0B" },
  { name: "Mua sắm", icon: "shopping-bag", color: "#F59E0B" },
  { name: "Mua sắm", icon: "shopping-bag", color: "#F59E0B" },
  { name: "Mua sắm", icon: "shopping-bag", color: "#F59E0B" },
  { name: "Mua sắm", icon: "shopping-bag", color: "#F59E0B" },
  { name: "Mua sắm", icon: "shopping-bag", color: "#F59E0B" },
  { name: "Mua sắm", icon: "shopping-bag", color: "#F59E0B" },
  { name: "Mua sắm", icon: "shopping-bag", color: "#F59E0B" },
  { name: "Mua sắm", icon: "shopping-bag", color: "#F59E0B" },
  { name: "Mua sắm", icon: "shopping-bag", color: "#F59E0B" },
  { name: "Mua sắm", icon: "shopping-bag", color: "#F59E0B" },
  { name: "Mua sắm", icon: "shopping-bag", color: "#F59E0B" },
  { name: "Mua sắm", icon: "shopping-bag", color: "#F59E0B" },
  { name: "Mua sắm", icon: "shopping-bag", color: "#F59E0B" },
  { name: "Mua sắm", icon: "shopping-bag", color: "#F59E0B" },
  { name: "Mua sắm", icon: "shopping-bag", color: "#F59E0B" },
  { name: "Mua sắm", icon: "shopping-bag", color: "#F59E0B" },
  { name: "Mua sắm", icon: "shopping-bag", color: "#F59E0B" },
  { name: "Mua sắm", icon: "shopping-bag", color: "#F59E0B" },
  { name: "Mua sắm", icon: "shopping-bag", color: "#F59E0B" },
];

const accountTypes = [
  {
    id: "wallet",
    name: "Wallet",
    icon: "account-balance-wallet",
    color: "#EF4444",
    balance: 32000,
  },
  {
    id: "bank",
    name: "Bank",
    icon: "account-balance",
    color: "#22C55E",
    balance: 2511000,
  },
];

const ThemDanhMuc = () => {
  const { category } = useLocalSearchParams();
  const [selectMethod, setSelectMethod] = useState<string>(
    String(category ?? "Wallet")
  );
  const [showModal, setShowModal] = useState(false);
  console.log(category);
  const [inputAmount, setInputAmount] = useState<string>("");
  const [inputDetail, setInputDetail] = useState<string>("");

  const isInvalidAmount = useMemo(
    () => inputAmount !== "" && isNaN(Number(inputAmount)),
    [inputAmount]
  );

  return (
    <View className="flex-1 bg-background">
      {/* HEADER */}
      <View className="bg-primary rounded-b-[40px] pb-6 pt-12">
        <View className="items-center">
          <TouchableOpacity
            className="absolute left-4"
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={25} color="white" />
          </TouchableOpacity>

          <Text className="text-xl font-bold text-white">Thêm danh mục</Text>
        </View>
      </View>

      {/* NỘI DUNG */}
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
      >
        {/* DANH MỤC (3 cột) */}
        <View className="">
          <View className="flex-row flex-wrap justify-between">
            {dataDanhMuc.map((item, idx) => (
              <TouchableOpacity
                key={`${item.name}-${idx}`}
                className="w-[30%] items-center mb-5"
                onPress={() => console.log("Chọn:", item.name)}
                activeOpacity={0.8}
              >
                <View
                  className="w-16 h-16 rounded-full justify-center items-center"
                  style={{ backgroundColor: item.color }}
                >
                  <MaterialIcons name={item.icon} size={28} color="#FFFFFF" />
                </View>
                <Text
                  className="w-full text-black text-[13px] mt-2 text-center"
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
            {/* Nếu số lượng không chia hết cho 3 → thêm “Xem thêm” để lấp ô cuối */}
            {dataDanhMuc.length % 3 !== 0 && (
              <TouchableOpacity
                className="w-[30%] items-center mb-5"
                onPress={() => router.push("/taoDanhMuc")}
              >
                <View className="w-16 h-16 rounded-full justify-center items-center bg-gray-300">
                  <MaterialIcons name="add" size={28} color="#FFFFFF" />
                </View>
                <Text className="w-full text-black text-[13px] mt-2 text-center">
                  Tạo
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ThemDanhMuc;
