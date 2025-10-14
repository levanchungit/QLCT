import { formatMoney } from "@/src/utils/format";
import { MaterialIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import type { IconProps } from "@expo/vector-icons/build/createIconSet";
type MaterialIconName = IconProps<keyof typeof MaterialIcons.glyphMap>["name"];

const dataDanhMuc: { name: string; icon: MaterialIconName; color: string }[] = [
  { name: "4G", icon: "sim-card", color: "#FFA500" },
  { name: "Trả nợ", icon: "money-off", color: "#FF4500" },
  { name: "Điện", icon: "flash-on", color: "#FFFF00" },
  { name: "Wifi", icon: "wifi", color: "#00FF00" },
  { name: "Đám tiệc", icon: "celebration", color: "#800080" },
];

const ChinhSuaGiaoDich = () => {
  const { category, percent, amount, method, detail } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState("Chi phí");
  const [inputAmount, setInputAmount] = useState(String(amount));
  const [inputDetail, setInputDetail] = useState(String(detail));
  const today = dayjs();
  const [selected, setSelected] = useState(today.format("DD/MM"));
  const [showModal, setShowModal] = useState(false);
  const [selectMethod, setSelectMethod] = useState(String(method));

  const dates = [
    { date: today.format("DD/MM"), label: "hôm nay" },
    { date: today.subtract(1, "day").format("DD/MM"), label: "hôm qua" },
    { date: today.subtract(2, "day").format("DD/MM"), label: "hai ngày trước" },
    { date: today.subtract(3, "day").format("DD/MM"), label: "ba ngày trước" },
    { date: today.subtract(4, "day").format("DD/MM"), label: "bốn ngày trước" },
  ];

  const accountTypes: {
    id: string;
    name: string;
    icon: MaterialIconName;
    color?: string;
    amount?: number;
  }[] = [
    {
      id: "cash",
      name: "Tiền mặt",
      icon: "attach-money",
      color: "#10B981",
      amount: 290000,
    },
    {
      id: "bank",
      name: "Bank",
      icon: "account-balance",
      color: "#22C55E",
      amount: 2131231,
    },
    {
      id: "wallet",
      name: "Wallet",
      icon: "account-balance-wallet",
      color: "#EF4444",
      amount: 7290000,
    },
  ];

  return (
    <View className="flex-1 bg-background">
      {/* HEADER cố định */}
      <View className="bg-primary rounded-b-[40px] pb-6 pt-12">
        <View className="items-center">
          <TouchableOpacity
            className="absolute left-4 top-3"
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={25} color="white" />
          </TouchableOpacity>

          <Text className="text-xl font-bold text-white">
            Chỉnh sửa giao dịch
          </Text>
        </View>

        {/* Tabs */}
        <View className="mt-6 px-4">
          <View className="flex-row w-full justify-around">
            {["Chi phí", "Thu nhập"].map((item) => {
              const isActive = item === activeTab;
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setActiveTab(item)}
                  className={`w-[30%] px-2 py-0.5 border-b-2 ${isActive ? "border-b-white" : "border-b-transparent"}`}
                >
                  <Text
                    className={`text-center font-bold text-lg ${isActive ? "text-white" : "text-gray-200"}`}
                  >
                    {item.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* NỘI DUNG CUỘN */}
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
      >
        {/* Amount */}
        <View className="flex-row justify-center items-center gap-4">
          <View className="w-[50%] max-w-[50%]">
            <TextInput
              className="text-black text-center text-2xl border-b-2 border-b-gray-400"
              keyboardType="numeric"
              value={inputAmount}
              onChangeText={setInputAmount}
              placeholder="Nhập số tiền"
              style={{ paddingBottom: 0 }}
            />
            <Text className="text-red-600 text-sm">
              Số tiền đã nhập không hợp lệ
            </Text>
          </View>
          <Text className="text-primary text-2xl">VND</Text>

          <TouchableOpacity onPress={() => console.log("calculator")}>
            <MaterialIcons name="calculate" size={40} color="green" />
          </TouchableOpacity>
        </View>

        {/* Tài khoản */}
        <View className="mt-4 gap-2">
          <TouchableOpacity onPress={() => setShowModal(true)}>
            <Text className="text-text text-sm">Tài khoản</Text>
            <View className="flex-row items-center gap-2">
              <Image
                source={require("../../assets/images/icon.png")}
                className="w-10 h-10"
                resizeMode="cover"
              />
              <Text className="text-black text-lg">{method}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Danh mục */}
        <View className="mt-4 gap-2">
          <View>
            <Text className="text-text text-sm">Danh mục</Text>
            <Text className="text-red-600 text-sm">
              Bạn phải chọn một danh mục
            </Text>
          </View>

          <View className="flex-row flex-wrap justify-between mt-2">
            {dataDanhMuc.map((item) => (
              <TouchableOpacity
                key={item.name}
                className="w-[30%] items-center mb-4"
                onPress={() => console.log(item.name)}
              >
                <View
                  className="w-16 h-16 rounded-full justify-center items-center"
                  style={{ backgroundColor: item.color }}
                >
                  <MaterialIcons name={item.icon} size={30} color="white" />
                </View>
                <Text className="w-full text-black text-lg mt-1 text-center">
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}

            {dataDanhMuc.length % 3 !== 0 && (
              <TouchableOpacity
                className="w-[30%] items-center mb-4"
                onPress={() =>
                  router.push({
                    pathname: "/danhMuc/taoDanhMuc",
                    params: {
                      category: category,
                    },
                  })
                }
              >
                <View className="w-16 h-16 rounded-full justify-center items-center bg-gray-300">
                  <MaterialIcons name="add" size={30} color="white" />
                </View>
                <Text className="w-full text-black text-lg mt-1 text-center">
                  Xem thêm
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Thanh chọn ngày (có thể cuộn ngang khi nhiều ngày) */}
        <View className="mt-2 flex-row items-center justify-between">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ columnGap: 16 }}
          >
            {dates.map((item) => {
              const isSelected = item.date === selected;
              return (
                <TouchableOpacity
                  key={item.date}
                  onPress={() => setSelected(item.date)}
                  className={`items-center rounded-lg px-2 py-1 ${isSelected ? "bg-primary" : ""}`}
                >
                  <Text
                    className={`text-sm font-semibold ${isSelected ? "text-white" : "text-black"}`}
                  >
                    {item.date}
                  </Text>
                  <Text
                    className={`text-xs ${isSelected ? "text-white" : "text-gray-500"}`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity onPress={() => console.log("Mở lịch")}>
            <MaterialIcons name="calendar-today" size={28} color="green" />
          </TouchableOpacity>
        </View>

        {/* Ghi chú */}
        <View className="mt-4">
          <Text className="text-text text-sm">Ghi chú</Text>
          <TextInput
            className="text-black border-b-2"
            value={inputDetail}
            onChangeText={setInputDetail}
            placeholder="Nhập ghi chú"
            maxLength={4096}
          />
          {/* Count length input */}
          <Text className="text-right text-text">
            {inputDetail.length.toString()}/4096
          </Text>
        </View>

        {/* Ảnh */}
        <View className="mt-2">
          <View>
            <Text className="text-text text-sm">Ảnh</Text>
          </View>

          <View className="flex-wrap flex-row gap-2 mt-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <TouchableOpacity
                key={index}
                className="w-[31%] items-center justify-center"
                onPress={() => console.log("Add", index)}
              >
                <View className="w-20 h-20 rounded-xl justify-center items-center bg-gray-400">
                  <MaterialIcons name="add" size={40} color="white" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Button save */}
      <View className="justify-center items-center">
        <TouchableOpacity
          onPress={() => console.log("click Lưu")}
          className="absolute bottom-12 w-[70%] bg-button rounded-full p-4 shadow-lg"
        >
          <Text className="text-center">Lưu</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showModal} animationType="fade" transparent>
        {/* Backdrop */}
        <Pressable
          className="flex-1 bg-black/40"
          onPress={() => setShowModal(false)}
        />

        {/* Dialog giữa màn hình */}
        <View className="absolute inset-0 items-center justify-center px-6">
          <View className="w-full rounded-2xl bg-white p-4">
            {/* Header */}
            <Text className="text-base font-semibold text-black mb-2">
              Chọn tài khoản
            </Text>

            {/* List dọc kiểu radio */}
            {accountTypes.map((item) => {
              const isSelected = selectMethod === item.name; // bạn đang dùng setSelectMethod(item.name)
              return (
                <TouchableOpacity
                  key={item.id}
                  className="flex-row items-center py-2"
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectMethod(item.name); // set lại state lựa chọn của bạn
                    setShowModal(false); // đóng dialog sau khi chọn
                  }}
                >
                  {/* Radio */}
                  <View
                    className="w-5 h-5 rounded-full border mr-3"
                    style={{
                      borderColor: "#9CA3AF",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isSelected && (
                      <View
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: "#10B981" }}
                      />
                    )}
                  </View>

                  {/* Icon tròn màu */}
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: item.color }}
                  >
                    <MaterialIcons name={item.icon} size={18} color="#fff" />
                  </View>

                  {/* Tên + số dư */}
                  <View className="flex-1">
                    <Text className="text-[15px] text-black">{item.name}</Text>
                    <Text className="text-[12px] text-gray-500">
                      {formatMoney(item.amount ?? 0)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Footer: HỦY */}
            <View className="mt-2 flex-row justify-end">
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text className="font-bold" style={{ color: "#10B981" }}>
                  HỦY
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ChinhSuaGiaoDich;
