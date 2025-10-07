import { router } from "expo-router";
import React, { useEffect } from "react";
import { Image, StatusBar, StyleSheet, View } from "react-native";

const Index = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/main"); // tự động chuyển sau 3 giây
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-primary">
      <StatusBar hidden={true} />
      <Image
        source={require("../assets/images/cost-logo-256.png")}
        className="w-32 h-32"
        resizeMode="cover"
      />
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({});
