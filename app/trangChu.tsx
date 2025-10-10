import HeaderMenu from "@/components/HeaderMenu";
import { formatMoney } from "@/utils/format";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const data = [
  {
    category: "Ăn uống",
    percent: "50%",
    amount: 500000,
    method: "Bank",
    detail: "Ăn sáng",
  },
  {
    category: "Di chuyển",
    percent: "30%",
    amount: 300000,
    method: "Wallet",
    detail: "Xăng xe",
  },
  {
    category: "Giải trí",
    percent: "20%",
    amount: 200000,
    method: "Bank",
    detail: "Mua ChatGPT",
  },
];

const dataChart = [
  {
    name: "Seoul",
    population: 21500000,
    color: "rgba(131, 167, 234, 1)",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  },
  {
    name: "Toronto",
    population: 2800000,
    color: "#F00",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  },
  {
    name: "Beijing",
    population: 527612,
    color: "red",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  },
  {
    name: "New York",
    population: 8538000,
    color: "#ffffff",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  },
  {
    name: "Moscow",
    population: 11920000,
    color: "rgb(0, 0, 255)",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  },
];

const screenWidth = Dimensions.get("window").width;

const TrangChu = () => {
  const [activeTab, setActiveTab] = useState("Chi phí");
  const [time, setTime] = useState("Ngày");
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-bg">
      {/* Nút 3 gạch + (tuỳ chọn) tiêu đề */}
      <StatusBar style="dark" translucent backgroundColor="transparent" />

      {/* Nền xanh đặt absolute để phủ lên vùng đỉnh */}
      <View
        style={{ paddingTop: insets.top + 8 }} // đẩy nội dung xuống bên trong vùng an toàn
        className="absolute top-0 left-0 right-0 h-[180px] bg-primary rounded-b-[40px]"
      >
        <View className="items-center">
          <Text className="text-xl text-white">Tổng cộng</Text>
          <TouchableOpacity>
            <Text className="text-white font-bold text-2xl">3.500.000 đ</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* HeaderMenu trong suốt */}
      <HeaderMenu backgroundColor="transparent" />

      <View className="flex justify-between items-center p-4 absolute top-20 w-full">
        <View className="flex w-full flex-row justify-around mt-2">
          {["Chi phí", "Thu nhập"].map((item) => {
            const isActive = item === activeTab;
            return (
              <TouchableOpacity
                key={item}
                onPress={() => setActiveTab(item)}
                className={`w-[30%] px-2 py-0.5 border-b-2 ${
                  isActive ? "border-b-white" : "border-b-transparent"
                }`}
              >
                <Text
                  className={`text-center font-bold text-lg ${
                    isActive ? "text-white" : "text-gray-400"
                  }`}
                >
                  {item.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="bg-white m-2 rounded-3xl">
          <View className="flex flex-row justify-between my-2 mx-4">
            {["Ngày", "Tuần", "Tháng", "Năm", "Khoảng thời gian"].map(
              (item) => {
                const isActive = item === time;
                return (
                  <TouchableOpacity
                    key={item}
                    onPress={() => setTime(item)}
                    className={`px-2 py-1 border-b-2 ${
                      isActive ? "border-b-primary" : "border-b-transparent"
                    }`}
                  >
                    <Text
                      className={`${
                        isActive ? "text-primary font-bold" : "text-gray-400"
                      }`}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }
            )}
          </View>

          {/* 1 view chua: 2 nut chuyen doi ngày trước và ngày sau và ngày hiện tại có thể thay đổi */}
          <View className="flex flex-row justify-between px-4">
            <TouchableOpacity>
              <MaterialIcons
                className="text-primary"
                name="keyboard-arrow-left"
                size={25}
                color="#4B5563"
              />
            </TouchableOpacity>

            <TouchableOpacity>
              <Text className="text-primary text-lg font-bold">
                Tháng 10, 2023
              </Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <MaterialIcons
                name="keyboard-arrow-right"
                size={25}
                color="#4B5563"
              />
            </TouchableOpacity>
          </View>

          {/* 2 view chua: bieu do */}
          <PieChart
            data={dataChart}
            width={screenWidth}
            height={200}
            chartConfig={{
              backgroundColor: "#ff3e03",
              backgroundGradientFrom: "#ff3e03",
              backgroundGradientTo: "#ff3e03",
              color: (opacity = 1) => `rgba(${0}, ${0}, ${0}, ${opacity})`,
            }}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"0"}
          />

          <TouchableOpacity className="absolute bottom-4 right-4 bg-button rounded-full p-4 shadow-lg">
            <MaterialIcons name="add" size={24} />
          </TouchableOpacity>
        </View>

        <View className="flex w-full gap-2">
          {/* item: thể loại thu, chi*/}
          {data.map((item) => {
            return (
              <TouchableOpacity
                key={item.category}
                onPress={() =>
                  router.push({
                    pathname: "/giaoDich/chiTietGiaoDich",
                    params: {
                      category: item.category,
                      percent: String(item.percent),
                      amount: String(item.amount),
                      method: item.method,
                      detail: item.detail,
                    },
                  })
                }
                className="flex-row w-full p-2 bg-white rounded-lg shadow-lg items-center"
              >
                <Image
                  source={require("../assets/images/icon.png")}
                  className="w-10 h-10"
                  resizeMode="cover"
                />
                <Text className="w-[50%] text-left font-bold text-text">
                  {item.category}
                </Text>
                <Text className="w-[10%] text-center font-bold text-text">
                  {item.percent}
                </Text>
                <Text className="w-[30%] text-center font-bold text-text">
                  {formatMoney(item.amount)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default TrangChu;
