import { Drawer } from "expo-router/drawer";
import "./global.css";
export default function RootLayout() {
  return (
    <Drawer screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="index" options={{ title: "Trang chủ" }} />
      <Drawer.Screen name="taiKhoan" options={{ title: "Tài khoản" }} />
    </Drawer>
  );
}
