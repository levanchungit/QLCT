// app/trangChu.tsx
import HeaderMenu from "@/components/HeaderMenu";
import { categoryBreakdown, totalInRange } from "@/src/repos/transactionRepo";
import { formatMoney } from "@/src/utils/format";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;
const CHART_SIZE = screenWidth * 0.6;
const HOLE_RATIO = 0.55;
type Tab = "Chi phí" | "Thu nhập";
type RangeKind = "Ngày" | "Tuần" | "Tháng" | "Năm" | "Khoảng thời gian";

function getRange(kind: RangeKind, anchor: Date) {
  const d = new Date(anchor);
  d.setHours(0, 0, 0, 0);

  if (kind === "Ngày") {
    const start = d.getTime() / 1000;
    return {
      startSec: start,
      endSec: start + 86400,
      label: d.toLocaleDateString(),
    };
  }
  if (kind === "Tuần") {
    const wd = (d.getDay() + 6) % 7; // Mon=0
    const startDate = new Date(d);
    startDate.setDate(d.getDate() - wd);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);
    return {
      startSec: startDate.getTime() / 1000,
      endSec: endDate.getTime() / 1000,
      label: `${startDate.getDate()} thg ${startDate.getMonth() + 1} - ${endDate.getDate()} thg ${endDate.getMonth() + 1}`,
    };
  }
  if (kind === "Tháng") {
    const startDate = new Date(d.getFullYear(), d.getMonth(), 1);
    const endDate = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    return {
      startSec: startDate.getTime() / 1000,
      endSec: endDate.getTime() / 1000,
      label: `Tháng ${d.getMonth() + 1}, ${d.getFullYear()}`,
    };
  }
  if (kind === "Năm") {
    const startDate = new Date(d.getFullYear(), 0, 1);
    const endDate = new Date(d.getFullYear() + 1, 0, 1);
    return {
      startSec: startDate.getTime() / 1000,
      endSec: endDate.getTime() / 1000,
      label: `${d.getFullYear()}`,
    };
  }
  // "Khoảng thời gian" – tạm dùng như Ngày, sau bạn gắn date picker
  const start = d.getTime() / 1000;
  return {
    startSec: start,
    endSec: start + 86400,
    label: d.toLocaleDateString(),
  };
}

const TrangChu = () => {
  const [activeTab, setActiveTab] = useState<Tab>("Chi phí");
  const [time, setTime] = useState<RangeKind>("Tuần");
  const [anchor, setAnchor] = useState<Date>(new Date());
  const [total, setTotal] = useState<number>(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [listData, setListData] = useState<
    { category: string; percent: string; amount: number; color?: string }[]
  >([]);

  const insets = useSafeAreaInsets();
  const { startSec, endSec, label } = useMemo(
    () => getRange(time, anchor),
    [time, anchor]
  );

  // ... bên trong component TrangChu:
  const loadAll = React.useCallback(async () => {
    const type = activeTab === "Chi phí" ? "expense" : "income";
    // tổng
    const sum = await totalInRange(startSec, endSec, type);
    setTotal(sum);

    // breakdown
    const rows = await categoryBreakdown(startSec, endSec, type);
    const grand = rows.reduce((s, r) => s + (r.total || 0), 0) || 1;
    const palette = [
      "#60a5fa",
      "#34d399",
      "#f59e0b",
      "#ef4444",
      "#a78bfa",
      "#fb7185",
      "#22d3ee",
      "#84cc16",
    ];

    setChartData(
      rows.map((r, i) => ({
        name: r.name ?? "Khác",
        population: r.total,
        color: r.color ?? palette[i % palette.length],
        legendFontColor: "#7F7F7F",
        legendFontSize: 13,
      }))
    );
    setListData(
      rows.map((r, i) => ({
        category: r.name ?? "Khác",
        percent: `${Math.round((r.total / grand) * 100)}%`,
        amount: r.total,
        color: r.color ?? palette[i % palette.length],
      }))
    );
  }, [activeTab, startSec, endSec]);

  // load tổng + breakdown khi tab/time thay đổi
  useEffect(() => {
    (async () => {
      const type = activeTab === "Chi phí" ? "expense" : "income";
      const sum = await totalInRange(startSec, endSec, type);
      setTotal(sum);

      const rows = await categoryBreakdown(startSec, endSec, type);
      const grand = rows.reduce((s, r) => s + (r.total || 0), 0) || 1;
      const palette = [
        "#60a5fa",
        "#34d399",
        "#f59e0b",
        "#ef4444",
        "#a78bfa",
        "#fb7185",
        "#22d3ee",
        "#84cc16",
      ];

      // Dữ liệu cho biểu đồ
      const chart = rows.map((r, i) => ({
        name: r.name ?? "Khác",
        population: r.total,
        color: r.color ?? palette[i % palette.length],
        legendFontColor: "#7F7F7F",
        legendFontSize: 13,
      }));
      setChartData(chart);

      // Dữ liệu cho danh sách
      const list = rows.map((r, i) => ({
        category: r.name ?? "Khác",
        percent: `${Math.round((r.total / grand) * 100)}%`,
        amount: r.total,
        color: r.color ?? palette[i % palette.length],
      }));
      setListData(list);
    })();
  }, [activeTab, startSec, endSec]);

  // điều hướng mốc thời gian khi bấm mũi tên
  const shiftAnchor = (dir: -1 | 1) => {
    const a = new Date(anchor);
    if (time === "Ngày" || time === "Khoảng thời gian")
      a.setDate(a.getDate() + dir);
    else if (time === "Tuần") a.setDate(a.getDate() + dir * 7);
    else if (time === "Tháng") a.setMonth(a.getMonth() + dir);
    else if (time === "Năm") a.setFullYear(a.getFullYear() + dir);
    setAnchor(a);
  };

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return (
    <View className="flex-1 bg-bg">
      <StatusBar style="dark" translucent backgroundColor="transparent" />

      {/* Header xanh */}
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="absolute top-0 left-0 right-0 h-[180px] bg-primary rounded-b-[40px]"
      >
        <View className="items-center">
          <Text className="text-xl text-white">Tổng cộng</Text>
          <TouchableOpacity>
            <Text className="text-white font-bold text-2xl">
              {formatMoney(total)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <HeaderMenu backgroundColor="transparent" />

      <View className="flex justify-between items-center p-4 absolute top-20 w-full gap-2 mt-2">
        {/* Tabs Chi phí | Thu nhập */}
        <View className="flex w-full flex-row justify-around">
          {(["Chi phí", "Thu nhập"] as Tab[]).map((item) => {
            const isActive = item === activeTab;
            return (
              <TouchableOpacity
                key={item}
                onPress={() => setActiveTab(item)}
                className={`w-[30%] px-2 py-0.5 border-b-2 ${
                  isActive ? "border-b-white" : "border-b-transparent"
                }`}
              >
                <Text
                  className={`text-center font-bold text-lg ${
                    isActive ? "text-white" : "text-gray-400"
                  }`}
                >
                  {item.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bộ lọc thời gian */}
        <View className="bg-white p-2 w-full rounded-3xl">
          <View className="flex flex-row justify-between my-2 mx-4">
            {(
              [
                "Ngày",
                "Tuần",
                "Tháng",
                "Năm",
                "Khoảng thời gian",
              ] as RangeKind[]
            ).map((item) => {
              const isActive = item === time;
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setTime(item)}
                  className={`px-2 py-1 border-b-2 ${
                    isActive ? "border-b-primary" : "border-b-transparent"
                  }`}
                >
                  <Text
                    className={`${isActive ? "text-primary font-bold" : "text-gray-400"}`}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Điều hướng mốc thời gian */}
          <View className="flex flex-row justify-between px-4">
            <TouchableOpacity onPress={() => shiftAnchor(-1)}>
              <MaterialIcons
                name="keyboard-arrow-left"
                size={25}
                color="#4B5563"
              />
            </TouchableOpacity>

            <TouchableOpacity>
              <Text className="text-primary text-lg font-bold">{label}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => shiftAnchor(1)}>
              <MaterialIcons
                name="keyboard-arrow-right"
                size={25}
                color="#4B5563"
              />
            </TouchableOpacity>
          </View>

          <View className="w-full items-center">
            <View
              style={{
                width: CHART_SIZE,
                height: CHART_SIZE,
                alignSelf: "center",
                position: "relative",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <PieChart
                data={chartData}
                width={CHART_SIZE}
                height={CHART_SIZE}
                accessor="population"
                hasLegend={false}
                backgroundColor="transparent"
                paddingLeft="0"
                center={[CHART_SIZE / 4, 0]}
                chartConfig={{
                  backgroundColor: "transparent",
                  backgroundGradientFrom: "transparent",
                  backgroundGradientTo: "transparent",
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
              />

              {/* Lỗ giữa + tổng cộng */}
              <View
                style={{
                  position: "absolute",
                  alignItems: "center",
                  justifyContent: "center",
                  width: CHART_SIZE * HOLE_RATIO,
                  height: CHART_SIZE * HOLE_RATIO,
                  borderRadius: (CHART_SIZE * HOLE_RATIO) / 2,
                  backgroundColor: "#fff",
                }}
              >
                <Text className="text-gray-800 font-bold text-xl">
                  {formatMoney(total)}
                </Text>
              </View>
            </View>
          </View>

          {/* Nút thêm */}
          <TouchableOpacity
            onPress={async () => {
              // await seedSampleMonthRandom({ year: 2025, month: 9, count: 15 });
              // await loadAll();
              router.push({
                pathname: "/giaoDich/chinhSuaGiaoDich",
              });
            }}
            className="absolute bottom-4 right-4 bg-button rounded-full p-4 shadow-lg"
          >
            <MaterialIcons name="add" size={24} />
          </TouchableOpacity>
        </View>

        {/* Danh sách chi tiết theo danh mục */}
        <View className="flex w-full gap-2">
          {listData.map((item) => (
            <TouchableOpacity
              key={item.category}
              onPress={() =>
                router.push({
                  pathname: "/giaoDich/chiTietGiaoDich",
                  params: {
                    category: item.category,
                    percent: item.percent,
                    amount: String(item.amount),
                  },
                })
              }
              className="flex-row w-full p-2 bg-white rounded-lg shadow-lg items-center"
            >
              <View
                className="w-10 h-10 rounded-full mr-2"
                style={{ backgroundColor: item.color ?? "#e5e7eb" }}
              />
              <Text className="w-[50%] text-left font-bold text-text">
                {item.category}
              </Text>
              <Text className="w-[10%] text-center font-bold text-text">
                {item.percent}
              </Text>
              <Text className="w-[28%] text-center font-bold text-text">
                {formatMoney(item.amount)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

export default TrangChu;
