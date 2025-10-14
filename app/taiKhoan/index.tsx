import HeaderMenu from "@/components/HeaderMenu";
import { formatMoney } from "@/src/utils/format";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const accounts = [
  {
    id: 1,
    name: "Wallet",
    amount: 12000,
    color: "#EF4444",
    icon: "account-balance-wallet",
  },
  {
    id: 2,
    name: "Bank",
    amount: 3210000,
    color: "#22C55E",
    icon: "account-balance",
  },
];

const TaiKhoan = () => {
  return (
    <View className="flex-1 bg-background">
      {/* Header xanh bo tròn đáy + shadow */}
      <HeaderMenu
        title="Tài khoản"
        backgroundColor="bg-primary"
        height="h-[90px]"
        paddingTop="pt-[30px]"
      />

      {/* Tổng cộng */}
      <View className="items-center mt-4">
        <Text className="text-gray-500 text-base">Tổng cộng:</Text>
        <Text className="text-3xl font-extrabold text-gray-900 mt-1">
          3,22 Tr đ
        </Text>
      </View>

      {/* 2 nút tính năng */}
      <View className="flex-row justify-around px-6 mt-4">
        <TouchableOpacity className="items-center">
          <View className="w-14 h-14 rounded-2xl bg-primary items-center justify-center">
            <MaterialIcons name="history" size={26} color="white" />
          </View>
          <Text className="mt-2 text-gray-600 text-xs text-center w-28">
            Lịch sử chuyển khoản
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <View className="w-14 h-14 rounded-2xl bg-primary items-center justify-center">
            <MaterialIcons name="swap-horiz" size={26} color="white" />
          </View>
          <Text className="mt-2 text-gray-600 text-xs text-center w-28">
            Giao dịch chuyển khoản mới
          </Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách tài khoản */}
      <View className="mt-6 px-4 gap-3">
        {accounts.map((acc) => (
          <TouchableOpacity
            key={acc.id}
            className="flex-row items-center bg-white rounded-xl p-3 shadow"
            onPress={() =>
              router.push({
                pathname: "/taiKhoan/chiTietTaiKhoan",
                params: {
                  id: acc.id,
                  name: acc.name,
                  amount: acc.amount,
                  color: acc.color,
                  icon: acc.icon,
                },
              })
            }
          >
            <View
              className="w-9 h-9 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: acc.color }}
            >
              <MaterialIcons name={acc.icon as any} size={20} color="white" />
            </View>
            <Text className="flex-1 text-gray-800 font-semibold">
              {acc.name}
            </Text>
            <Text className="text-gray-700 font-semibold">
              {formatMoney(acc.amount)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity className="absolute bottom-12 self-center w-20 h-20 rounded-full bg-button items-center justify-center shadow-xl">
        <MaterialIcons name="add" size={32} color="black" />
      </TouchableOpacity>
    </View>
  );
};

export default TaiKhoan;
