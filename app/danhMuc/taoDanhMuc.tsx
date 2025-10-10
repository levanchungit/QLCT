import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type IconName = keyof typeof MaterialIcons.glyphMap;

const ICONS: IconName[] = [
  "assignment",
  "flight-takeoff",
  "credit-card",
  "pets",
  "computer",
  "ramen-dining",
  "handyman",
  "local-laundry-service",
  "terrain",
  "sports-esports",
  "directions-car",
  "local-hospital",
  "menu-book",
  "checkroom",
  "directions-run",
];

const PALETTE = [
  "#E53935",
  "#1E88E5",
  "#EC4899",
  "#F59E0B",
  "#22C55E",
  "#84CC16",
  "#60A5FA",
  "#94A3B8",
];

const TaoDanhMuc = () => {
  // state
  const [name, setName] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [budget, setBudget] = useState("");
  const [iconIdx, setIconIdx] = useState<number | null>(null);
  const [color, setColor] = useState(PALETTE[0]);

  const nameInvalid = useMemo(() => name.trim() === "", [name]);
  const canSubmit = useMemo(
    () => !nameInvalid && iconIdx !== null,
    [nameInvalid, iconIdx]
  );

  const onSubmit = () => {
    if (!canSubmit) return;
    console.log({
      name,
      type,
      budget: budget ? Number(budget) : null,
      icon: iconIdx !== null ? ICONS[iconIdx] : undefined,
      color,
    });
    router.back();
  };

  return (
    <View className="flex-1 bg-[#F8FAF7]">
      {/* Header */}
      <View className="bg-primary rounded-b-[28px] pt-10 pb-4 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="ml-3  text-white text-lg font-bold">
            Tạo danh mục
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Tên danh mục */}
        <View className="mb-4">
          <View
            className="rounded-lg bg-white px-3 py-2 shadow-sm"
            style={{ shadowOpacity: 0.05 }}
          >
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Tên danh mục"
              placeholderTextColor="#9CA3AF"
              className="text-[15px] text-black"
            />
            <View className="h-[1px] bg-[#E57373] mt-2" />
            {nameInvalid && (
              <Text className="text-[#E57373] text-xs mt-1">
                Nhập tên danh mục
              </Text>
            )}
          </View>
        </View>

        {/* Loại: Chi phí / Thu nhập */}
        <View className="mb-4">
          <View className="flex-row items-center">
            {/* Chi phí */}
            <TouchableOpacity
              className="flex-row items-center mr-6"
              onPress={() => setType("expense")}
              activeOpacity={0.8}
            >
              <View className="w-5 h-5 rounded-full border border-[#5AA786] items-center justify-center mr-2">
                {type === "expense" && (
                  <View className="w-3 h-3 rounded-full bg-[#5AA786]" />
                )}
              </View>
              <Text className="text-[15px] text-black">Chi phí</Text>
            </TouchableOpacity>

            {/* Thu nhập */}
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => setType("income")}
              activeOpacity={0.8}
            >
              <View className="w-5 h-5 rounded-full border border-gray-400 items-center justify-center mr-2">
                {type === "income" && (
                  <View className="w-3 h-3 rounded-full bg-[#5AA786]" />
                )}
              </View>
              <Text className="text-[15px] text-black">Thu nhập</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Kế hoạch chi tiêu */}
        <View className="mb-6">
          <Text className="text-gray-500 mb-2">Kế hoạch chi tiêu</Text>
          <View className="flex-row items-center">
            <View className="flex-1 border-b border-gray-300 pb-1 mr-3">
              <TextInput
                value={budget}
                onChangeText={setBudget}
                keyboardType="numeric"
                placeholder="Chưa chọn"
                placeholderTextColor="#BDBDBD"
                className="text-[15px] text-black"
              />
            </View>
            <Text className="text-gray-500">VND mỗi tháng</Text>
          </View>
        </View>

        {/* Biểu tượng */}
        <Text className="text-gray-500 mb-2">Biểu tượng</Text>
        <View className="flex-row flex-wrap justify-between">
          {ICONS.map((n, i) => {
            const selected = iconIdx === i;
            return (
              <TouchableOpacity
                key={`${n}-${i}`}
                onPress={() => setIconIdx(i)}
                activeOpacity={0.8}
                className="w-[22%] items-center mb-4"
              >
                <View
                  className="w-16 h-16 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: selected ? "#7FAF9A" : "#AEBFBA",
                  }}
                >
                  <MaterialIcons name={n} size={26} color="#EFF6F3" />
                </View>
              </TouchableOpacity>
            );
          })}

          {/* nút ... màu vàng */}
          <TouchableOpacity
            onPress={() => console.log("More icons")}
            className="w-[22%] items-center mb-4"
            activeOpacity={0.8}
          >
            <View
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{ backgroundColor: "#F7C948" }}
            >
              <MaterialIcons name="more-horiz" size={26} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Màu sắc */}
        <Text className="text-gray-500 mt-2 mb-3">Màu sắc</Text>
        <View className="flex-row items-center flex-wrap">
          {PALETTE.map((c) => {
            const selected = color === c;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                className="mr-3 mb-3"
                activeOpacity={0.8}
              >
                <View
                  className="w-7 h-7 rounded-full items-center justify-center"
                  style={{ backgroundColor: c }}
                >
                  {selected && (
                    <MaterialIcons name="check" size={18} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
          {/* nút + màu xám */}
          <TouchableOpacity
            onPress={() => console.log("Custom color")}
            className="mr-3 mb-3"
          >
            <View className="w-7 h-7 rounded-full items-center justify-center bg-[#AEBFBA]">
              <MaterialIcons name="add" size={18} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Nút Thêm cố định */}
      <View className="absolute left-0 right-0 bottom-8 px-6 pb-6 pt-3 bg-transparent">
        <TouchableOpacity
          onPress={onSubmit}
          disabled={!canSubmit}
          activeOpacity={0.9}
          className={`h-12 rounded-2xl items-center justify-center ${canSubmit ? "bg-button" : "bg-[#E9E5D8]"}`}
        >
          <Text className="text-[#6B6B6B] font-semibold">Thêm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TaoDanhMuc;
