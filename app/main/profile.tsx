import HeaderMenu from "@/components/HeaderMenu";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function Profile() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    username?: string;
    email?: string;
  }>();

  const user = {
    name: params.username || "Không rõ",
    email: params.email || "Không có email",
    id: params.id || "N/A",
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=640",
  };

  return (
    <View className="flex-1 bg-light">
      <HeaderMenu
        title={"Hồ sơ"}
        backgroundColor="bg-primary"
        height="h-[90px]"
        paddingTop="pt-[30px]"
      />

      <View className="px-6 mt-6 items-center">
        <View className="relative">
          <Image
            source={{ uri: user.avatar }}
            className="w-40 h-40 rounded-full border-4 border-white"
          />
          <TouchableOpacity className="absolute bottom-3 right-3 bg-primaryDark p-2 rounded-full">
            <MaterialCommunityIcons name="pencil" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View className="mt-10 w-full space-y-4">
          <View className="flex-row items-center bg-white rounded-xl p-4 border border-gray-100">
            <MaterialCommunityIcons name="account" size={24} color="#1877F2" />
            <View className="ml-3">
              <Text className="text-gray-500 text-xs">Tên</Text>
              <Text className="text-gray-800 text-base font-medium">
                {user.name}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center bg-white rounded-xl p-4 border border-gray-100">
            <MaterialCommunityIcons
              name="email-outline"
              size={24}
              color="#5C7F64"
            />
            <View className="ml-3">
              <Text className="text-gray-500 text-xs">Địa chỉ email</Text>
              <Text className="text-gray-800 text-base font-medium">
                {user.email}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center bg-white rounded-xl p-4 border border-gray-100">
            <MaterialIcons name="badge" size={24} color="#9CA3AF" />
            <Text className="ml-3 text-gray-500">ID: {user.id}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.replace("/auth/login")}
          className="flex-row items-center self-end mt-8 bg-green-100 px-4 py-2 rounded-xl"
        >
          <Text className="text-primaryDark font-semibold mr-1">Thoát</Text>
          <MaterialIcons name="logout" size={18} color="#5C7F64" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
