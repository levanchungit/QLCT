import HeaderMenu from "@/components/HeaderMenu";
import { loginWithPassword } from "@/src/repos/authRepo";
import { useUser } from "@/src/userContext";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
  const [showPassword, setShowPassword] = useState(false); // 👁 toggle mật khẩu
  const { loginSet } = useUser();

  // Helper: nhường 1 frame cho UI render spinner
  const yieldToUI = () =>
    new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  async function onLogin(email: string, password: string) {
    if (loading) return; // chặn bấm liên tục
    if (!email || !password) return alert("Vui lòng nhập đầy đủ thông tin");

    try {
      setLoading(true);
      await yieldToUI(); // đảm bảo overlay hiển thị trước khi gọi API

      const user = await loginWithPassword({
        username: email.trim(),
        password,
      });

      await loginSet({
        id: user.id,
        username: user.username,
        email: email.trim(),
      });

      router.replace({
        pathname: "/main/profile",
        params: { id: user.id, username: user.username, email },
      });
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      if (msg === "EMPTY_FIELDS") {
        alert("Vui lòng nhập đầy đủ email và mật khẩu");
      } else {
        alert("Đăng nhập thất bại");
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = !!email && !!password && !loading;

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
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
          className="bg-white rounded-xl px-5 py-3 text-base border border-gray-200"
        />

        {/* Input mật khẩu có nút con mắt */}
        <View className="relative">
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Mật khẩu"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPassword}
            editable={!loading}
            autoCapitalize="none"
            className="bg-white rounded-xl px-5 py-3 text-base border border-gray-200 pr-12"
          />
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            disabled={loading}
            style={{ position: "absolute", right: 16, top: "28%" }}
          >
            <MaterialIcons
              name={showPassword ? "visibility" : "visibility-off"}
              size={22}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          disabled={!canSubmit}
          onPress={() => onLogin(email, password)}
          className={`py-4 rounded-2xl items-center ${
            canSubmit ? "bg-yellow" : "bg-[#FBDE8E]"
          }`}
        >
          <Text className="text-gray-700 font-bold text-base">
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Overlay loading toàn màn hình (block mọi thao tác) */}
      {loading && (
        <View
          pointerEvents="auto"
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.25)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              paddingVertical: 18,
              paddingHorizontal: 22,
              borderRadius: 16,
              backgroundColor: "white",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 140,
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <ActivityIndicator size="large" />
            <Text
              style={{ marginTop: 10, fontWeight: "600", color: "#111827" }}
            >
              Đang đăng nhập...
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
