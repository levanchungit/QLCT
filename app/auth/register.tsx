import HeaderMenu from "@/components/HeaderMenu";
import { createUserWithPassword } from "@/src/repos/authRepo";
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

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // <-- trạng thái loading
  const [showPassword, setShowPassword] = useState(false);

  async function onRegister(username: string, password: string) {
    if (loading) return; // chặn bấm liên tục
    try {
      setLoading(true); // bật overlay
      const userId = await createUserWithPassword({
        username: username.trim(),
        password,
      });
      alert("Đăng ký thành công!");
      // router.replace("/"); // nếu muốn điều hướng sau khi đăng ký
    } catch (e: any) {
      if (e?.message === "USERNAME_TAKEN") alert("Tên đăng nhập đã tồn tại");
      else alert("Đăng ký thất bại");
      console.error(e);
    } finally {
      setLoading(false); // tắt overlay
    }
  }

  const canSubmit = !!email && !!password && !loading;

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
          editable={!loading}
          placeholder="Địa chỉ email"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#9CA3AF"
          className="bg-white rounded-xl px-5 py-3 text-base border border-gray-200"
        />

        {/* Input mật khẩu có nút con mắt */}
        <View className="relative">
          <TextInput
            value={password}
            onChangeText={setPassword}
            editable={!loading}
            placeholder="Mật khẩu"
            secureTextEntry={!showPassword}
            placeholderTextColor="#9CA3AF"
            className="bg-white rounded-xl px-5 py-3 text-base border border-gray-200 pr-12"
          />
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            style={{
              position: "absolute",
              right: 16,
              top: "28%",
            }}
            disabled={loading}
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
          onPress={() => onRegister(email, password)}
          className={`mt-4 py-4 rounded-2xl items-center ${
            canSubmit ? "bg-yellow" : "bg-[#FBDE8E]"
          }`}
        >
          <Text className="text-gray-700 font-bold text-base">
            {loading ? "Đang xử lý..." : "Đăng ký "}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Overlay loading toàn màn hình */}
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
              Đang đăng ký...
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
