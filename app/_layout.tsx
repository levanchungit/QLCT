import { openDb } from "@/src/db";
import { Drawer } from "expo-router/drawer";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "./global.css";

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
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Drawer screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="index" options={{ title: "Trang chủ" }} />
      <Drawer.Screen name="taiKhoan" options={{ title: "Tài khoản" }} />
    </Drawer>
  );
}
