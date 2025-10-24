import HeaderMenu from "@/components/HeaderMenu";
import { loginWithPassword } from "@/src/repos/authRepo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function onLogin(username: string, password: string) {
    try {
      const user = await loginWithPassword({ username: username, password });
      alert("Đăng nhập thành công!");
      console.log(user);
      router.replace({
        pathname: "/main/profile",
        params: {
          id: user.id,
          username: user.username,
        },
      });
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      if (msg === "EMPTY_FIELDS") {
        alert("Vui lòng nhập đầy đủ username và mật khẩu");
      } else if (
        msg === "WRONG_CREDENTIALS" ||
        msg === "WRONG_PASSWORD" ||
        msg === "USER_NOT_FOUND"
      ) {
        alert("username hoặc mật khẩu không đúng");
      } else {
        alert("Đăng nhập thất bại");
        console.error(e);
      }
    }
  }

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

      <View className="flex-1 px-6 pt-10 gap-2">
        <Text className="text-xl text-gray-800 font-bold mb-5">
          Vui lòng nhập thông tin đăng nhập
        </Text>

        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Địa chỉ username"
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
          disabled={!username}
          onPress={() => onLogin(username, password)}
          className={` py-4 rounded-2xl items-center ${
            username ? "bg-yellow" : "bg-[#FBDE8E]"
          }`}
        >
          <Text className="text-gray-700 font-bold text-base">Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
