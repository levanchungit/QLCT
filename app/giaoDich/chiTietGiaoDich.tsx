// chiTietGiaoDich.tsx
import { deleteTx, getTxById } from "@/src/repos/transactionRepo";
import { formatDate, formatDateTimeVN, formatMoney } from "@/src/utils/format";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";

const ChiTietLoaiGiaoDich = () => {
  const params = useLocalSearchParams<{
    id?: string;
    category?: string;
    percent?: string;
    amount?: string;
    method?: string;
    detail?: string;
    occurred_at?: string;
    updated_at?: string;
  }>();

  const [tx, setTx] = React.useState<null | {
    id: string;
    amount: number;
    note: string | null;
    occurred_at: number;
    updated_at: number | null;
    account_name: string;
    category_name: string | null;
  }>(null);

  const id = String(params.id ?? "");

  const refresh = React.useCallback(async () => {
    if (!id) return;
    const row = await getTxById(id);
    if (row) setTx(row);
  }, [id]);

  // load lần đầu + mỗi lần focus (sau khi update quay lại)
  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );
  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDelete = React.useCallback(() => {
    if (!id) return;
    Alert.alert(
      "Xoá giao dịch",
      "Bạn có chắc muốn xoá giao dịch này?",
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTx(id);
              router.back(); // màn trước tự refresh nhờ useFocusEffect ở đó (nếu đã setup)
            } catch (e: any) {
              Alert.alert("Không thể xoá", e?.message ?? String(e));
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [id]);

  // dữ liệu để hiển thị (ưu tiên từ DB, fallback params)
  const amount = tx?.amount ?? Number(params.amount ?? 0);
  const method = tx?.account_name ?? params.method ?? "";
  const category = tx?.category_name ?? params.category ?? "";
  const detail = tx?.note ?? params.detail ?? "";
  const occurred_at = tx?.occurred_at ?? Number(params.occurred_at ?? 0);
  const updated_at = tx?.updated_at ?? Number(params.updated_at ?? 0);

  return (
    <View className="flex-1 bg-background">
      <View className="flex h-[100px] bg-primary rounded-b-[40px]">
        <View className="flex items-center align-middle">
          <TouchableOpacity
            className="absolute left-4 top-14"
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={25} color="white" />
          </TouchableOpacity>

          <Text className="text-xl font-bold text-white pt-14">
            Chi tiết giao dịch
          </Text>

          <TouchableOpacity
            className="absolute right-4 top-14"
            onPress={() =>
              router.push({
                pathname: "/giaoDich/chinhSuaGiaoDich",
                // ⚠️ NHỚ truyền id & occurred_at để màn sửa biết bản ghi nào
                params: {
                  id,
                  category,
                  amount: String(amount),
                  method,
                  detail,
                  occurred_at: String(occurred_at),
                },
              })
            }
          >
            <MaterialIcons name="edit" size={25} color="white" />
          </TouchableOpacity>
        </View>

        <View className="flex mt-10 p-4 gap-4">
          <View className="gap-2">
            <Text className="text-text text-sm">Số tiền</Text>
            <Text className="text-black text-lg">{formatMoney(amount)}</Text>
          </View>

          <View className="gap-2">
            <Text className="text-text text-sm">Tài khoản</Text>
            <View className="flex flex-row items-center gap-2">
              <Image
                source={require("../../assets/images/icon.png")}
                className="w-10 h-10"
                resizeMode="cover"
              />
              <Text className="text-black text-lg">{method}</Text>
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-text text-sm">Danh mục</Text>
            <View className="flex flex-row items-center gap-2">
              <Image
                source={require("../../assets/images/icon.png")}
                className="w-10 h-10"
                resizeMode="cover"
              />
              <Text className="text-black text-lg">{category}</Text>
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-text text-sm">Ngày</Text>
            <Text className="text-black text-lg">
              {formatDate(occurred_at)}
            </Text>
          </View>

          <View className="gap-2">
            <Text className="text-text text-sm">Ghi chú</Text>
            <Text className="text-black text-lg">{detail}</Text>
          </View>

          <View className="flex gap-10 mt-4">
            <TouchableOpacity onPress={() => console.log("sao chép")}>
              <Text className="text-primary">SAO CHÉP</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleDelete}>
              <Text className="text-red-600">XOÁ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="flex-1">
        <Text className="absolute bottom-12 p-4 text-text">
          {updated_at ? formatDateTimeVN(updated_at) : ""}
        </Text>
      </View>
    </View>
  );
};

export default ChiTietLoaiGiaoDich;
