// app/danhMuc/index.tsx
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
    // seed lần đầu cho đẹp
    await seedCategoryDefaults();
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

  return (
    <View className="flex-1 bg-background">
      {/* Header gọn */}
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

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
      >
        <View className="flex-row flex-wrap justify-between">
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="w-[30%] items-center mb-5"
              onPress={() =>
                router.push({
                  pathname: "/danhMuc/taoDanhMuc",
                  params: { id: item.id },
                })
              }
              activeOpacity={0.85}
            >
              <View
                className="w-16 h-16 rounded-full justify-center items-center"
                style={{ backgroundColor: item.color ?? "#7EC5E8" }}
              >
                {renderIcon(item.icon)}
              </View>
              <Text
                className="w-full text-black text-[13px] mt-2 text-center"
                numberOfLines={2}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Ô “Tạo” */}
          <TouchableOpacity
            className="w-[30%] items-center mb-5"
            onPress={() => router.push("/danhMuc/taoDanhMuc")}
            activeOpacity={0.85}
          >
            <View className="w-16 h-16 rounded-full justify-center items-center bg-gray-400">
              <MaterialIcons name="add" size={28} color="#fff" />
            </View>
            <Text className="w-full text-black text-[13px] mt-2 text-center">
              Tạo
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
