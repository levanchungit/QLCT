// app/taoDanhMuc.tsx
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  createCategory,
  deleteCategory,
  getCategoryById,
  updateCategory,
} from "@/src/repos/categoryRepo";

/** ===== Helpers cho icon (match code mẫu) ===== */
type IconLib = "mi" | "mc"; // mi = MaterialIcons, mc = MaterialCommunityIcons
const packIcon = (lib: IconLib, name: string) => `${lib}:${name}`;
const unpackIcon = (val?: string): { lib: IconLib; name: string } => {
  if (!val) return { lib: "mi", name: "assignment" };
  if (val.includes(":")) {
    const [lib, name] = val.split(":");
    return { lib: (lib as IconLib) ?? "mi", name: name ?? "assignment" };
  }
  return { lib: "mi", name: val };
};

const renderIconByLib = (
  lib: IconLib,
  name: string,
  color: string,
  size = 26
) =>
  lib === "mi" ? (
    <MaterialIcons name={name as any} size={size} color={color} />
  ) : (
    <MaterialCommunityIcons name={name as any} size={size} color={color} />
  );

/** Lưới icon (có thể thêm/bớt) */
const iconOptions: { lib: IconLib; name: string }[] = [
  { lib: "mi", name: "assignment" },
  { lib: "mi", name: "flight-takeoff" },
  { lib: "mi", name: "credit-card" },
  { lib: "mi", name: "pets" },
  { lib: "mi", name: "computer" },
  { lib: "mc", name: "noodles" },
  { lib: "mi", name: "handyman" },
  { lib: "mi", name: "local-laundry-service" },
  { lib: "mi", name: "terrain" },
  { lib: "mi", name: "sports-esports" },
  { lib: "mi", name: "directions-car" },
  { lib: "mi", name: "local-hospital" },
  { lib: "mi", name: "menu-book" },
  { lib: "mi", name: "checkroom" },
  { lib: "mi", name: "directions-run" },
];

/** Bảng màu */
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
  const params = useLocalSearchParams<{ id?: string }>();
  const editingId = params?.id as string | undefined;
  const isEdit = !!editingId;

  // state
  const [name, setName] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [budget, setBudget] = useState(""); // UI-only
  const [selectedIcon, setSelectedIcon] = useState<string>(
    packIcon("mi", "assignment")
  );
  const [color, setColor] = useState(PALETTE[0]);
  const [loading, setLoading] = useState(false);

  // load when editing
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setLoading(true);
        const cat = await getCategoryById(editingId!);
        if (cat) {
          setName(cat.name);
          setType(cat.type); // load type từ DB
          const { lib, name } = unpackIcon(cat.icon ?? undefined);
          setSelectedIcon(packIcon(lib, name));
          setColor(cat.color ?? PALETTE[0]);
        }
      } catch (e) {
        console.warn("Load category error", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [isEdit, editingId]);

  const nameInvalid = useMemo(() => name.trim() === "", [name]);
  const canSubmit = useMemo(
    () => !nameInvalid && !!selectedIcon && !loading,
    [nameInvalid, selectedIcon, loading]
  );

  const onSubmit = async () => {
    if (!canSubmit) return;
    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        type, // BẮT BUỘC
        icon: selectedIcon, // "mi:..." | "mc:..."
        color,
      };

      if (isEdit) {
        await updateCategory(editingId!, payload);
      } else {
        await createCategory(payload);
      }
      router.back();
    } catch (e) {
      console.error("Save category failed:", e);
      Alert.alert("Lỗi", "Không thể lưu danh mục. Thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (!isEdit) return;
    Alert.alert("Xóa danh mục", "Bạn có chắc muốn xóa danh mục này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await deleteCategory(editingId!);
            router.back();
          } catch (e) {
            console.error("Delete category failed:", e);
            Alert.alert("Lỗi", "Không thể xóa danh mục. Thử lại sau.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const selectedColor = color;

  return (
    <View className="flex-1 bg-[#F8FAF7]">
      {/* Header */}
      <View className="bg-primary rounded-b-[28px] pt-10 pb-4 px-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="ml-3 text-white text-lg font-bold">
              {isEdit ? "Sửa danh mục" : "Tạo danh mục"}
            </Text>
          </View>

          {isEdit && (
            <TouchableOpacity
              onPress={onDelete}
              disabled={loading}
              className="px-2 py-1 rounded-lg"
            >
              <MaterialIcons name="delete" size={22} color="#fff" />
            </TouchableOpacity>
          )}
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
              editable={!loading}
            />
            <View className="h-[1px] bg-[#E57373] mt-2" />
            {nameInvalid && (
              <Text className="text-[#E57373] text-xs mt-1">
                Nhập tên danh mục
              </Text>
            )}
          </View>
        </View>

        {/* Loại */}
        <View className="mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              className="flex-row items-center mr-6"
              onPress={() => setType("expense")}
              activeOpacity={0.8}
              disabled={loading}
            >
              <View className="w-5 h-5 rounded-full border border-[#5AA786] items-center justify-center mr-2">
                {type === "expense" && (
                  <View className="w-3 h-3 rounded-full bg-[#5AA786]" />
                )}
              </View>
              <Text className="text-[15px] text-black">Chi phí</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => setType("income")}
              activeOpacity={0.8}
              disabled={loading}
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

        {/* Kế hoạch chi tiêu (UI-only) */}
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
                editable={!loading}
              />
            </View>
            <Text className="text-gray-500">VND mỗi tháng</Text>
          </View>
        </View>

        {/* Biểu tượng */}
        <View>
          <Text className="text-gray-500 mb-2">Biểu tượng</Text>
          <View className="flex-row flex-wrap">
            {iconOptions.map((opt) => {
              const value = packIcon(opt.lib, opt.name);
              const active = selectedIcon === value;
              return (
                <TouchableOpacity
                  key={`${opt.lib}:${opt.name}`}
                  activeOpacity={0.85}
                  onPress={() => setSelectedIcon(value)}
                  className="w-1/5 items-center my-2"
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  disabled={loading}
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

            {/* nút ... màu vàng */}
            <TouchableOpacity
              onPress={() =>
                Alert.alert("Biểu tượng", "Sẽ bổ sung thư viện khác")
              }
              className="w-1/5 items-center my-2"
              activeOpacity={0.85}
              disabled={loading}
            >
              <View
                className="w-14 h-14 rounded-full items-center justify-center"
                style={{
                  backgroundColor: "#F7C948",
                  borderWidth: 2,
                  borderColor: "#F7C948",
                }}
              >
                <MaterialIcons name="more-horiz" size={24} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Màu sắc */}
        <Text className="text-gray-500 mt-4 mb-3">Màu sắc</Text>
        <View className="flex-row items-center flex-wrap">
          {PALETTE.map((c) => {
            const active = color === c;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                className="mr-3 mb-3"
                activeOpacity={0.8}
                disabled={loading}
              >
                <View
                  className="w-7 h-7 rounded-full items-center justify-center"
                  style={{ backgroundColor: c }}
                >
                  {active && (
                    <MaterialIcons name="check" size={18} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            onPress={() => Alert.alert("Màu sắc", "Sẽ mở color picker")}
            className="mr-3 mb-3"
            disabled={loading}
          >
            <View className="w-7 h-7 rounded-full items-center justify-center bg-[#AEBFBA]">
              <MaterialIcons name="add" size={18} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Nút Lưu */}
      <View className="absolute left-0 right-0 bottom-8 px-6 pb-6 pt-3 bg-transparent">
        <TouchableOpacity
          onPress={onSubmit}
          disabled={!canSubmit}
          activeOpacity={0.9}
          className={`h-12 rounded-2xl items-center justify-center ${canSubmit ? "bg-button" : "bg-[#E9E5D8]"}`}
        >
          <Text className="text-[#6B6B6B] font-semibold">
            {isEdit
              ? loading
                ? "Đang lưu..."
                : "Lưu thay đổi"
              : loading
                ? "Đang thêm..."
                : "Thêm"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TaoDanhMuc;
