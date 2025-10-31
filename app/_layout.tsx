// app/_layout.tsx
import { openDb } from "@/src/db";
import { UserProvider, useUser } from "@/src/userContext";
import {
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, usePathname } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PaperProvider } from "react-native-paper";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import "./global.css";

type MenuItem = {
  key: string;
  label: string;
  iconLib: "mci" | "mi" | "fe";
  iconName: string;
  route?: string; // segment trong /app
};

// Danh sách menu (theo ảnh)
const TOP_ITEMS: MenuItem[] = [
  {
    key: "home",
    label: "Trang chủ",
    iconLib: "mci",
    iconName: "home-outline",
    route: "index",
  },
  {
    key: "account",
    label: "Tài khoản",
    iconLib: "mci",
    iconName: "cash-multiple",
    route: "taiKhoan",
  },
  {
    key: "chart",
    label: "Biểu đồ",
    iconLib: "mci",
    iconName: "chart-bar",
    route: "bieuDo",
  },
  {
    key: "category",
    label: "Danh mục",
    iconLib: "mci",
    iconName: "view-list",
    route: "danhMuc",
  },
  {
    key: "payment",
    label: "Thanh toán thông thường",
    iconLib: "mci",
    iconName: "cash-sync",
    route: "thanhToan",
  },
  {
    key: "remind",
    label: "Nhắc nhở",
    iconLib: "mci",
    iconName: "bell-outline",
    route: "nhacNho",
  },
  {
    key: "settings",
    label: "Cài đặt",
    iconLib: "mci",
    iconName: "cog-outline",
    route: "caiDat",
  },
];

// icon helper
function Icon({
  lib,
  name,
  size = 22,
  color = "#EAF5EE",
}: {
  lib: "mci" | "mi" | "fe";
  name: string;
  size?: number;
  color?: string;
}) {
  if (lib === "mi")
    return <MaterialIcons name={name as any} size={size} color={color} />;
  if (lib === "fe")
    return <Feather name={name as any} size={size} color={color} />;
  return (
    <MaterialCommunityIcons name={name as any} size={size} color={color} />
  );
}

// 1 dòng item
function DrawerItemRow({
  item,
  navigate,
  active,
}: {
  item: MenuItem;
  navigate: (route?: string) => void;
  active: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={() => navigate(item.route)}
      activeOpacity={0.85}
      className={`flex-row items-center py-3 px-5 rounded-lg ${active ? "bg-white/10" : ""}`}
    >
      <Icon lib={item.iconLib} name={item.iconName} />
      <Text
        className={`ml-3 text-[16px] ${active ? "text-white font-semibold" : "text-white"}`}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );
}

// Drawer content fullscreen
function CustomDrawerContent(props: any) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { user, logout, refresh } = useUser();

  useEffect(() => {
    const unsub = props.navigation.addListener("drawerOpen", () => {
      refresh();
    });
    return unsub;
  }, [props.navigation, refresh]);

  const navigate = (route?: string) => {
    if (!route) return;
    props.navigation.closeDrawer();
    props.navigation.navigate(route);
  };
  const isActive = (route?: string) =>
    route ? pathname === `/${route}` : false;

  const handleAuthPress = async () => {
    if (user) {
      props.navigation.closeDrawer();
      router.push("/main/profile");
    } else {
      props.navigation.closeDrawer();
      router.push("/auth");
    }
  };

  return (
    // Fullscreen: không inset phía trên, chỉ tôn trọng bottom cho thanh điều hướng
    <SafeAreaView edges={["bottom"]} className="flex-1">
      <LinearGradient
        colors={["#2E6B5B", "#6DA187"]}
        style={{ flex: 1, paddingTop: insets.top }}
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-3 border-b border-white/40">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={handleAuthPress}
          >
            <View className="w-16 h-16 rounded-full border border-white/50 items-center justify-center mr-4">
              <MaterialCommunityIcons
                name="account"
                size={36}
                color="#EAF5EE"
              />
            </View>
            <Text className="text-white text-lg font-semibold">
              {user ? user.username : "Đăng nhập / Đăng ký"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Menu list (scrollable) */}
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {/* Nhóm trên */}
          <View className="mt-4 px-2">
            {TOP_ITEMS.map((it) => (
              <DrawerItemRow
                key={it.key}
                item={it}
                navigate={navigate}
                active={isActive(it.route)}
              />
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await openDb();
        if (mounted) setReady(true);
      } catch (e) {
        console.error("DB init failed:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <UserProvider>
          <Drawer
            screenOptions={{
              headerShown: false,
              drawerStyle: { width: "82%", backgroundColor: "transparent" },
              overlayColor: "rgba(0,0,0,0.35)",
            }}
            drawerContent={(props) => <CustomDrawerContent {...props} />}
          >
            <Drawer.Screen name="index" options={{ title: "Trang chủ" }} />
            <Drawer.Screen name="taiKhoan" options={{ title: "Tài khoản" }} />
            <Drawer.Screen name="danhMuc" options={{ title: "Danh mục" }} />
            <Drawer.Screen name="auth" options={{ title: "Đăng nhập" }} />
          </Drawer>
        </UserProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
