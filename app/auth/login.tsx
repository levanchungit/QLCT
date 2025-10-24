import HeaderMenu from "@/components/HeaderMenu";
import { loginWithPassword } from "@/src/repos/authRepo";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper: nhường 1 frame cho UI render spinner
  const yieldToUI = () =>
    new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  async function onLogin(email: string, password: string) {
    if (!email || !password) return alert("Vui lòng nhập đầy đủ thông tin");

    try {
      setLoading(true);
      await yieldToUI(); // 👈 đảm bảo spinner hiển thị

      const user = await loginWithPassword({ username: email, password });
      // ⚠️ Nếu dùng alert ngay, spinner sẽ bị modal che — có thể bỏ alert để thấy rõ spinner
      // alert("Đăng nhập thành công!");

      router.replace({
        pathname: "/main/profile",
        params: { id: user.id, username: user.username, email },
      });
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      if (msg === "EMPTY_FIELDS") {
        alert("Vui lòng nhập đầy đủ email và mật khẩu");
      } else if (
        msg === "WRONG_CREDENTIALS" ||
        msg === "WRONG_PASSWORD" ||
        msg === "USER_NOT_FOUND"
      ) {
        alert("Email hoặc mật khẩu không đúng");
      } else {
        alert("Đăng nhập thất bại");
        console.error(e);
      }
    } finally {
      setLoading(false);
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
          value={email}
          onChangeText={setEmail}
          placeholder="Địa chỉ email"
          placeholderTextColor="#9CA3AF"
          className="bg-white rounded-xl px-5 py-3 text-base border border-gray-200"
          editable={!loading}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Mật khẩu"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          className="bg-white rounded-xl px-5 py-3 text-base border border-gray-200"
          editable={!loading}
        />

        <TouchableOpacity
          disabled={!email || !password || loading}
          onPress={() => onLogin(email, password)}
          className={`py-4 rounded-2xl items-center ${
            email && password && !loading ? "bg-yellow" : "bg-[#FBDE8E]"
          }`}
        >
          <Text className="text-gray-700 font-bold text-base">
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Overlay loading toàn màn hình (bảo đảm thấy) */}
      {loading && (
        <View
          // Nếu bạn không dùng nativewind, đổi sang style={{...}}
          className="absolute top-0 left-0 right-0 bottom-0 bg-black/30 items-center justify-center"
          pointerEvents="none"
        >
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-white mt-3">Đang đăng nhập...</Text>
        </View>
      )}
    </View>
  );
}
