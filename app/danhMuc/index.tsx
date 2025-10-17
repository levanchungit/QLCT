// app/danhMuc/index.tsx
import HeaderMenu from "@/components/HeaderMenu";
import {
  listCategories,
  seedCategoryDefaults,
  type Category,
} from "@/src/repos/categoryRepo";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const renderIcon = (packed: string | null | undefined, size = 28) => {
  const v = packed ?? "mci:help-circle-outline";
  const [lib, name] = v.split(":");
  if (lib === "mi")
    return <MaterialIcons name={name as any} size={size} color="#fff" />;
  return <MaterialCommunityIcons name={name as any} size={size} color="#fff" />;
};

export default function DanhMucIndex() {
  const [items, setItems] = useState<Category[]>([]);

  const load = useCallback(async () => {
    await seedCategoryDefaults(); // seed lần đầu
    const rows = await listCategories();
    setItems(rows);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const COLS = 3;
  const data = [...items, { id: "create", isCreate: true } as any];
  const remainder = data.length % COLS;
  const fillers = (COLS - remainder) % COLS;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <HeaderMenu
        title="Thêm danh mục"
        backgroundColor="bg-primary"
        height="h-[90px]"
        paddingTop="pt-[30px]"
      />

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 140,
        }}
      >
        <View className="flex-row flex-wrap justify-center gap-x-6 gap-y-5">
          {data.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="w-[28%] items-center mb-5"
              onPress={() =>
                item.isCreate
                  ? router.push("/danhMuc/taoDanhMuc")
                  : router.push({
                      pathname: "/danhMuc/taoDanhMuc",
                      params: { id: item.id },
                    })
              }
              activeOpacity={0.85}
            >
              <View
                className={`w-16 h-16 rounded-full justify-center items-center ${
                  item.isCreate ? "bg-gray-400" : ""
                }`}
                style={
                  !item.isCreate
                    ? { backgroundColor: item.color ?? "#7EC5E8" }
                    : {}
                }
              >
                {item.isCreate ? (
                  <MaterialIcons name="add" size={28} color="#fff" />
                ) : (
                  renderIcon(item.icon)
                )}
              </View>
              <Text
                className="w-full text-black text-[13px] mt-2 text-center"
                numberOfLines={2}
              >
                {item.isCreate ? "Tạo" : item.name}
              </Text>
            </TouchableOpacity>
          ))}

          {Array.from({ length: fillers }).map((_, i) => (
            <View
              key={`spacer-${i}`}
              className="w-[28%] mb-5"
              style={{ opacity: 0 }}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
