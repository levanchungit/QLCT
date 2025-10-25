import HeaderMenu from "@/components/HeaderMenu";
import {
  AntDesign,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { makeRedirectUri } from "expo-auth-session";
import * as Facebook from "expo-auth-session/providers/facebook";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export default function Index() {
  const router = useRouter();
  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: "<FACEBOOK_APP_ID>",
    scopes: ["public_profile", "email"],
    redirectUri: makeRedirectUri({
      // Expo Go dùng proxy, build app thì bỏ useProxy và dùng scheme
      useProxy: true,
    }),
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { access_token } = response.params as any;
      router.replace("/main/profile");
    }
  }, [response]);

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <HeaderMenu
        title={"Đăng ký "}
        backgroundColor="bg-primary"
        height="h-[90px]"
        paddingTop="pt-[30px]"
      />

      <View className="flex px-6 pt-10 items-center">
        <Text className="text-lg text-gray-800 font-semibold mb-6">
          Đăng ký để lưu thông tin của bạn
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/auth/register")}
          className="w-[80%] bg-yellow py-4 rounded-full items-center"
        >
          <Text className="w-full text-center text-gray-700 font-bold text-base">
            Đăng ký
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-5"
          onPress={() => router.push("/auth/login")}
        >
          <Text className="text-center text-primary font-semibold text-base">
            Đăng nhập
          </Text>
        </TouchableOpacity>

        <View className="mt-16 items-center">
          <Text className="text-gray-600 mb-5">Đăng nhập với</Text>
          <View className="flex-row gap-6">
            <TouchableOpacity
              onPress={() => promptAsync()}
              disabled={!request}
              className="bg-white rounded-full px-5 py-3"
            >
              <FontAwesome name="facebook" size={26} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-white rounded-full px-5 py-3">
              <AntDesign name="google" size={26} color="black" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-white rounded-full px-5 py-3">
              <MaterialCommunityIcons name="apple" size={28} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
