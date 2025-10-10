import { MaterialIcons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

// Use keyof typeof MaterialIcons.glyphMap for icon names
type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

type Props = {
  title?: string;
  color?: string;
  size?: number;
  backgroundColor?: string;
  height?: string;
  icon?: MaterialIconName;
  paddingTop?: string;
};

export default function HeaderMenu({
  title,
  color = "white",
  size = 28,
  backgroundColor = "bg-transparent",
  height = "h-[120px]",
  icon = "menu",
  paddingTop = "40px",
}: Props) {
  const navigation = useNavigation();

  const handlePress = () => {
    if (icon === "menu") {
      navigation.dispatch(DrawerActions.toggleDrawer());
    } else if (icon === "arrow-back") {
      router.back();
    }
  };

  return (
    <View
      className={`flex flex-row rounded-b-[40px] items-center px-3 ${backgroundColor} ${height} ${paddingTop}`}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.6}
        className="items-center justify-center"
      >
        <MaterialIcons name={icon} size={size} color={color} />
      </TouchableOpacity>

      {title ? (
        <Text className="px-6 text-lg font-bold text-white">{title}</Text>
      ) : null}
    </View>
  );
}
