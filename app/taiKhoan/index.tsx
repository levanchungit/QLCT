// app/taiKhoan.tsx
import HeaderMenu from "@/components/HeaderMenu";
import { openDb } from "@/src/db";
import { formatMoney } from "@/src/utils/format";
import {
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type AccountRow = {
  id: string;
  name: string;
  icon?: string | null; // có thể là "mc:wallet" hoặc dữ liệu cũ: "wallet"
  color?: string | null;
  include_in_total: number; // 1 | 0
  balance_cached: number; // số dư đã được trigger cập nhật
};

// --- helpers: chuẩn hoá & render icon ---
const normalizeIcon = (raw?: string | null) => {
  if (!raw) return "mi:account-balance"; // mặc định MaterialIcons
  return raw.includes(":") ? raw : `mc:${raw}`; // dữ liệu cũ chỉ có tên -> mặc định mc
};

const renderIconByLib = (packed: string, color: string, size = 20) => {
  const [lib, name] = packed.split(":");
  if (lib === "mc") {
    return (
      <MaterialCommunityIcons name={name as any} size={size} color={color} />
    );
  }
  if (lib === "fa5") {
    return <FontAwesome5 name={name as any} size={size} color={color} />;
  }
  // mặc định MaterialIcons
  return <MaterialIcons name={name as any} size={size} color={color} />;
};

const TaiKhoan = () => {
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const db = await openDb();
    const rows = await db.getAllAsync<AccountRow>(
      `SELECT id, name, icon, color, include_in_total, balance_cached
       FROM accounts
       ORDER BY updated_at DESC NULLS LAST, name ASC`
    );
    setAccounts(rows);
    const sum = rows
      .filter((a) => a.include_in_total === 1)
      .reduce((s, a) => s + (a.balance_cached || 0), 0);
    setTotal(sum);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
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
          {formatMoney(total)}
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
      <ScrollView
        className="mt-6 px-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
      >
        <View className="gap-3 pb-28">
          {accounts.map((acc) => {
            const packedIcon = normalizeIcon(acc.icon); // "<lib>:<name>"
            const bg = acc.color ?? "#e5e7eb";
            return (
              <TouchableOpacity
                key={acc.id}
                className="flex-row items-center bg-white rounded-xl p-3 shadow"
                onPress={() =>
                  router.push({
                    pathname: "/taiKhoan/chiTietTaiKhoan",
                    params: {
                      id: acc.id,
                      name: acc.name,
                      amount: String(acc.balance_cached || 0),
                      color: bg,
                      icon: packedIcon, // truyền packed icon để màn chi tiết nhận đúng
                    },
                  })
                }
              >
                <View
                  className="w-9 h-9 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: bg }}
                >
                  {renderIconByLib(packedIcon, "#fff", 20)}
                </View>

                <Text className="flex-1 text-gray-800 font-semibold">
                  {acc.name}
                </Text>
                <Text className="text-gray-700 font-semibold">
                  {formatMoney(acc.balance_cached || 0)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* FAB thêm tài khoản */}
      <TouchableOpacity
        onPress={() => router.push("/taiKhoan/chiTietTaiKhoan")}
        className="absolute bottom-12 self-center w-16 h-16 rounded-full bg-button items-center justify-center shadow-xl"
      >
        <MaterialIcons name="add" size={28} color="black" />
      </TouchableOpacity>
    </View>
  );
};

export default TaiKhoan;
