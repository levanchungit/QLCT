import {
  listTxByCategory,
  type TxDetailRow,
} from "@/src/repos/transactionRepo";
import { formatMoney } from "@/src/utils/format";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

function groupByDate(rows: TxDetailRow[]) {
  const groups: Record<string, TxDetailRow[]> = {};
  rows.forEach((tx) => {
    const d = new Date(tx.occurred_at * 1000);
    const label = d.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    (groups[label] ||= []).push(tx);
  });
  return groups;
}

export default function GiaoDich() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const [items, setItems] = useState<TxDetailRow[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔄 Hàm làm mới danh sách
  const refresh = useCallback(async () => {
    if (!category) return;
    setLoading(true);
    try {
      const rows = await listTxByCategory({ categoryName: category });
      setItems(rows);
    } finally {
      setLoading(false);
    }
  }, [category]);

  // Gọi refresh khi mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // 👀 Làm mới mỗi khi quay lại màn này (sau khi xoá)
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const grouped = useMemo(() => groupByDate(items), [items]);
  const total = useMemo(() => items.reduce((s, t) => s + t.amount, 0), [items]);
  return (
    <View className="flex-1 bg-[#f9f9f9]">
      {/* Header */}
      <View className="h-[120px] bg-[#5A8F7B] rounded-b-[40px] items-center justify-center relative">
        <TouchableOpacity
          className="absolute left-4 top-12"
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={26} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-semibold">{category}</Text>
        <Text className="text-white text-2xl font-bold">
          {formatMoney(total)} đ
        </Text>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 mt-3">
        {loading ? (
          <Text className="text-center text-gray-500 mt-10">
            Đang tải dữ liệu...
          </Text>
        ) : Object.keys(grouped).length === 0 ? (
          <Text className="text-center text-gray-500 mt-10">
            Không có giao dịch nào
          </Text>
        ) : (
          Object.keys(grouped).map((date) => (
            <View key={date} className="mb-4">
              <Text className="ml-4 mb-2 text-gray-600 font-semibold">
                {date}
              </Text>

              {grouped[date].map((tx) => (
                <TouchableOpacity
                  key={tx.id}
                  className="mx-4 mb-3 p-4 bg-white rounded-2xl shadow-sm flex-row justify-between items-center"
                  activeOpacity={0.9}
                  onPress={() => {
                    router.push({
                      pathname: "/giaoDich/chiTietGiaoDich",
                      params: {
                        id: tx.id,
                        category: tx.category_name ?? "",
                        amount: String(tx.amount),
                        method: tx.account_name,
                        detail: tx.note ?? "",
                        occurred_at: String(tx.occurred_at),
                        updated_at: String(tx.updated_at),
                      },
                    });
                  }}
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-[#7EC5E8] justify-center items-center mr-3">
                      <MaterialIcons
                        name="shopping-basket"
                        size={24}
                        color="#fff"
                      />
                    </View>
                    <View>
                      <Text className="font-semibold text-black">
                        {tx.category_name ?? "Không có danh mục"}
                      </Text>
                      <Text className="text-gray-600 text-sm">
                        {tx.account_name}
                      </Text>
                      {tx.note && (
                        <Text className="text-gray-500 text-sm">{tx.note}</Text>
                      )}
                    </View>
                  </View>
                  <Text className="font-semibold text-gray-800">
                    {formatMoney(tx.amount)} đ
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <View className="justify-center items-center">
        <TouchableOpacity
          onPress={() => router.push("/giaoDich/chinhSuaGiaoDich")}
          className="absolute bottom-12 bg-button rounded-full p-4 shadow-lg"
        >
          <MaterialIcons name="add" size={30} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
