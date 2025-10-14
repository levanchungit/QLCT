import { formatMoney } from "@/src/utils/format";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const ChiTietLoaiGiaoDich = () => {
  const { category, percent, amount, method, detail } = useLocalSearchParams();

  return (
    <View className="flex-1 bg-background">
      <View className="flex h-[100px] bg-primary rounded-b-[40px]">
        <View className="flex items-center align-middle">
          <TouchableOpacity
            className="absolute left-4 top-14"
            onPress={() => {
              router.back();
            }}
          >
            <MaterialIcons name="arrow-back" size={25} color="white" />
          </TouchableOpacity>

          <Text className="text-xl  font-bold text-white pt-14">
            Chi tiết giao dịch
          </Text>

          <TouchableOpacity
            className="absolute right-4 top-14"
            onPress={() =>
              router.push({
                pathname: "/giaoDich/chinhSuaGiaoDich",
                params: {
                  category,
                  percent: String(percent),
                  amount: String(amount),
                  method,
                  detail,
                },
              })
            }
          >
            <MaterialIcons name="edit" size={25} color="white" />
          </TouchableOpacity>
        </View>

        <View className="flex mt-10 p-4 gap-4">
          <View className="gap-2">
            <Text className="text-text text-sm">Số tiền</Text>
            <Text className="text-black text-lg">
              {formatMoney(Number(amount))}
            </Text>
          </View>

          <View className="gap-2">
            <Text className="text-text text-sm">Tài khoản</Text>
            <View className="flex flex-row items-center gap-2">
              <Image
                source={require("../../assets/images/icon.png")}
                className="w-10 h-10"
                resizeMode="cover"
              />
              <Text className="text-black text-lg">{method}</Text>
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-text text-sm">Danh mục</Text>
            <View className="flex flex-row items-center gap-2">
              <Image
                source={require("../../assets/images/icon.png")}
                className="w-10 h-10"
                resizeMode="cover"
              />
              <Text className="text-black text-lg">{category}</Text>
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-text text-sm">Ngày</Text>
            <Text className="text-black text-lg">7 tháng 10, 2025</Text>
          </View>

          <View className="gap-2">
            <Text className="text-text text-sm">Ghi chú</Text>
            <Text className="text-black text-lg">{detail}</Text>
          </View>

          <View className="flex gap-10 mt-4">
            <TouchableOpacity
              onPress={() => console.log("sao chép")}
              className=""
            >
              <Text className="text-primary">SAO CHÉP</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => console.log("delete")}
              className=""
            >
              <Text className="text-red-600">XOÁ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="flex-1">
        <Text className="absolute bottom-12 p-4 text-text ">
          Đã tạo hôm nay lúc 14:20
        </Text>
      </View>
    </View>
  );
};

export default ChiTietLoaiGiaoDich;
