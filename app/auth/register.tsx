import HeaderMenu from "@/components/HeaderMenu";
import { createUserWithPassword } from "@/src/repos/authRepo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onRegister(username: string, password: string) {
    try {
      const userId = await createUserWithPassword({ username, password });
      alert("Đăng ký thành công!");
    } catch (e: any) {
      if (e.message === "USERNAME_TAKEN") alert("Tên đăng nhập đã tồn tại");
      else alert("Đăng ký thất bại");
      console.error(e);
    }
  }

  return (
    <View className="flex-1 bg-light">
      {/* Header */}
      <HeaderMenu
        title={"Đăng ký "}
        backgroundColor="bg-primary"
        icon="arrow-back"
        height="h-[90px]"
        paddingTop="pt-[30px]"
      />

      <View className="flex-1 px-6 pt-10 gap-2">
        <Text className="text-xl text-gray-800 font-bold mb-5">
          Vui lòng nhập địa chỉ email bạn muốn đăng ký
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Địa chỉ email"
          placeholderTextColor="#9CA3AF"
          className="bg-white rounded-xl px-5 py-3 text-base border border-gray-200"
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Mật khẩu"
          placeholderTextColor="#9CA3AF"
          className="bg-white rounded-xl px-5 py-3 text-base border border-gray-200"
        />

        <TouchableOpacity
          disabled={!email}
          onPress={() => onRegister(email, password)}
          className={`mt-4 py-4 rounded-2xl items-center ${
            email ? "bg-yellow" : "bg-[#FBDE8E]"
          }`}
        >
          <Text className="text-gray-700 font-bold text-base">Đăng ký </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
