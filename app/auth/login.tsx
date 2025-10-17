import HeaderMenu from "@/components/HeaderMenu";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  return (
    <View className="flex-1 bg-light">
      {/* Header */}
      <HeaderMenu
        title={"Đăng nhập"}
        backgroundColor="bg-primary"
        icon="arrow-back"
        height="h-[90px]"
        paddingTop="pt-[30px]"
      />

      <View className="flex-1 px-6 pt-10">
        <Text className="text-xl text-gray-800 font-bold mb-5">
          Vui lòng nhập địa chỉ email bạn đã đăng ký
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Địa chỉ email"
          placeholderTextColor="#9CA3AF"
          className="bg-white rounded-xl px-5 py-3 text-base border border-gray-200"
        />

        <TouchableOpacity
          disabled={!email}
          onPress={() => router.push("/main/profile")}
          className={`mt-6 py-3 rounded-2xl items-center ${
            email ? "bg-yellow" : "bg-[#FBDE8E]"
          }`}
        >
          <Text className="text-gray-700 font-bold text-base">Tiếp theo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
