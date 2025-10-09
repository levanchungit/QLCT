import { formatMoney } from "@/utils/format";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const ChiTietGiaoDich = () => {
  const { category, percent, amount, method, detail } = useLocalSearchParams();

  return (
    <View className="flex-1 bg-background">
      <View className="flex h-[120px] bg-primary rounded-b-[40px]">
        <View className="flex items-center align-middle">
          {/* icon back */}
          <TouchableOpacity
            className="absolute left-4 top-12"
            onPress={() => {
              router.back();
            }}
          >
            <MaterialIcons name="arrow-back" size={25} color="white" />
          </TouchableOpacity>

          <Text className="text-xl text-white pt-10">{category}</Text>
          <TouchableOpacity>
            <Text className="text-white font-bold text-2xl">
              {formatMoney(Number(amount))}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text className="ml-4  text-text mt-4 mb-2"> 7 tháng 10, 2025</Text>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/chiTietLoaiGiaoDich",
            params: {
              category,
              percent: String(percent),
              amount: String(amount),
              method,
              detail,
            },
          })
        }
        className="mx-4 p-4 bg-white rounded-3xl shadow-lg"
      >
        <View className="flex-row gap-2">
          <Image
            source={require("../assets/images/icon.png")}
            className="w-10 h-10"
            resizeMode="cover"
          />
          <View className="flex-1">
            <Text className="font-bold text-black">{category}</Text>
            <Text className="text-black">{method}</Text>
          </View>
          <Text className="font-bold text-text">
            {formatMoney(Number(amount))}
          </Text>
        </View>
        <Text className=" text-text">{detail}</Text>
      </TouchableOpacity>

      <View className="flex-1 justify-center items-center">
        <TouchableOpacity
          onPress={() => console.log("click add")}
          className="absolute bottom-12  bg-button rounded-full p-4 shadow-lg"
        >
          <MaterialIcons name="add" size={30} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChiTietGiaoDich;
