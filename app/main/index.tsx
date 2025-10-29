// app/trangChu.tsx
import HeaderMenu from "@/components/HeaderMenu";
import { openDb } from "@/src/db";
import { categoryBreakdown, totalInRange } from "@/src/repos/transactionRepo";
import { formatMoney } from "@/src/utils/format";
import {
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Platform,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const screenWidth = Dimensions.get("window").width;
const CHART_SIZE = screenWidth * 0.6;
const HOLE_RATIO = 0.55;
const ICON_SIZE = 25;
const isFabric = !!global?.nativeFabricUIManager;

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental &&
  !isFabric
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
const normalizeIcon = (raw?: string | null) =>
  raw ? (raw.includes(":") ? raw : `mc:${raw}`) : "mi:category";
const renderIconByLib = (packed: string, color: string, size = 18) => {
  const [lib, name] = packed.split(":");
  if (lib === "mc")
    return (
      <MaterialCommunityIcons name={name as any} size={size} color={color} />
    );
  if (lib === "fa5")
    return <FontAwesome5 name={name as any} size={size} color={color} />;
  return <MaterialIcons name={name as any} size={size} color={color} />; // "mi"
};

type Tab = "Chi phí" | "Thu nhập";
type RangeKind = "Ngày" | "Tuần" | "Tháng" | "Năm" | "Khoảng thời gian";

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const todayEOD = () => {
  const x = new Date();
  x.setHours(23, 59, 59, 999);
  return x;
};

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
      label: `${startDate.getDate()} thg ${startDate.getMonth() + 1} - ${endDate.getDate()} thg ${
        endDate.getMonth() + 1
      }`,
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
  // "Khoảng thời gian": range sẽ tính từ rangeStart/rangeEnd ở useMemo
  const start = d.getTime() / 1000;
  return {
    startSec: start,
    endSec: start + 86400,
    label: d.toLocaleDateString(),
  };
}

// hôm nay có nằm trong khoảng đang hiển thị không?
function isCurrentPeriod(startSec: number, endSec: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const t = today.getTime() / 1000;
  return t >= startSec && t < endSec;
}

const TrangChu = () => {
  const [activeTab, setActiveTab] = useState<Tab>("Chi phí");
  const [time, setTime] = useState<RangeKind>("Tuần");
  const [anchor, setAnchor] = useState<Date>(new Date());

  const [headerTotal, setHeaderTotal] = useState(0); // tổng số dư tài khoản (header)
  const [periodTotal, setPeriodTotal] = useState<number>(0); // tổng theo kỳ thời gian

  const [chartData, setChartData] = useState<any[]>([]);
  const [listData, setListData] = useState<
    {
      category: string;
      percent: string;
      amount: number;
      color?: string;
      icon?: string;
    }[]
  >([]);

  // range cho "Khoảng thời gian"
  const [rangeStart, setRangeStart] = useState<Date>(startOfDay(new Date()));
  const [rangeEnd, setRangeEnd] = useState<Date>(startOfDay(new Date()));
  const [showPicker, setShowPicker] = useState<null | "start" | "end">(null);

  const insets = useSafeAreaInsets();

  // Tính range hiển thị
  const { startSec, endSec, label } = useMemo(() => {
    if (time !== "Khoảng thời gian") return getRange(time, anchor);

    const s = startOfDay(rangeStart);
    const e = startOfDay(rangeEnd);
    const eExclusive = new Date(e);
    eExclusive.setDate(eExclusive.getDate() + 1); // end exclusive

    return {
      startSec: s.getTime() / 1000,
      endSec: eExclusive.getTime() / 1000,
      label: `${s.getDate()} thg ${s.getMonth() + 1} - ${e.getDate()} thg ${e.getMonth() + 1}`,
    };
  }, [time, anchor, rangeStart, rangeEnd]);

  // Tổng số dư tài khoản cho Header (không phụ thuộc thời gian)
  const loadHeaderTotal = useCallback(async () => {
    const db = await openDb();
    const rows = await db.getAllAsync<{
      include_in_total: number;
      balance_cached: number;
    }>(`SELECT include_in_total, balance_cached FROM accounts`);
    const sum = rows
      .filter((r) => r.include_in_total === 1)
      .reduce((s, r) => s + (r.balance_cached || 0), 0);
    setHeaderTotal(sum);
  }, []);

  // Dữ liệu theo kỳ (chart + list)
  const loadPeriodData = useCallback(async () => {
    const type = activeTab === "Chi phí" ? "expense" : "income";
    const sum = await totalInRange(startSec, endSec, type);
    setPeriodTotal(sum);

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
      rows
        .filter((r) => (r.total || 0) > 0) // tránh lát 0 gây rối
        .map((r, i) => {
          const pct = grand ? Math.round((r.total / grand) * 100) : 0;
          return {
            value: r.total,
            color: r.color ?? palette[i % palette.length],
            text: `${pct}%`, // <-- label phần trăm
          };
        })
    );

    setListData(
      rows.map((r, i) => ({
        category: r.name ?? "Khác",
        percent: `${Math.round((r.total / grand) * 100)}%`,
        amount: r.total,
        color: r.color ?? palette[i % palette.length],
        icon: normalizeIcon((r as any).icon), // đảm bảo có icon nếu cột tồn tại
      }))
    );
  }, [activeTab, startSec, endSec]);

  // Khi vào màn / refocus: refresh cả headerTotal và dữ liệu kỳ
  useFocusEffect(
    useCallback(() => {
      loadHeaderTotal();
      loadPeriodData();
    }, [loadHeaderTotal, loadPeriodData])
  );

  // Khi thay đổi tab hoặc mốc thời gian: reload dữ liệu kỳ
  useEffect(() => {
    loadPeriodData();
  }, [loadPeriodData]);

  const atCurrentPeriod = isCurrentPeriod(startSec, endSec);
  const canGoNext = !atCurrentPeriod;

  // Điều hướng mốc thời gian (không cho đi tới tương lai)
  const shiftAnchor = (dir: -1 | 1) => {
    if (dir === 1 && !canGoNext) return;

    const a = new Date(anchor);
    if (time === "Ngày" || time === "Khoảng thời gian")
      a.setDate(a.getDate() + dir);
    else if (time === "Tuần") a.setDate(a.getDate() + dir * 7);
    else if (time === "Tháng") a.setMonth(a.getMonth() + dir);
    else if (time === "Năm") a.setFullYear(a.getFullYear() + dir);
    setAnchor(a);
  };

  return (
    <View className="flex-1 bg-light">
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
              {formatMoney(headerTotal)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <HeaderMenu backgroundColor="transparent" />

      <View className="flex justify-between items-center p-4 absolute top-20 w-full gap-2 mt-2">
        {/* Tabs */}
        <View className="w-full flex-row justify-around">
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
                    isActive ? "text-white" : "text-gray-300"
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
          <View className="flex-row justify-between my-2 mx-4">
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

          {/* Khoảng thời gian: 2 nút chọn ngày, ẩn mũi tên */}
          {time === "Khoảng thời gian" ? (
            <>
              <View className="flex-row items-center justify-center gap-2 px-4 py-1">
                <TouchableOpacity
                  onPress={() => setShowPicker("start")}
                  className="px-3 py-1 rounded-lg border border-gray-300"
                >
                  <Text>{`${rangeStart.getDate()} thg ${rangeStart.getMonth() + 1}`}</Text>
                </TouchableOpacity>
                <Text>-</Text>
                <TouchableOpacity
                  onPress={() => setShowPicker("end")}
                  className="px-3 py-1 rounded-lg border border-gray-300"
                >
                  <Text>{`${rangeEnd.getDate()} thg ${rangeEnd.getMonth() + 1}`}</Text>
                </TouchableOpacity>
              </View>

              {showPicker && (
                <DateTimePicker
                  value={showPicker === "start" ? rangeStart : rangeEnd}
                  mode="date"
                  display="calendar"
                  maximumDate={todayEOD()} // chặn chọn tương lai
                  onChange={(evt, date) => {
                    setShowPicker(null);
                    if (!date) return;

                    if (showPicker === "start") {
                      const s = startOfDay(date);
                      if (s > rangeEnd) setRangeEnd(s); // auto hợp lệ
                      setRangeStart(s);
                    } else {
                      const e = startOfDay(date);
                      if (e < rangeStart) setRangeStart(e);
                      setRangeEnd(e);
                    }
                  }}
                />
              )}
            </>
          ) : (
            // Các chế độ còn lại: mũi tên trái/label/mũi tên phải (ẩn > nếu ở kỳ hiện tại)
            <View className="flex-row justify-between px-4 items-center">
              <TouchableOpacity onPress={() => shiftAnchor(-1)}>
                <MaterialIcons
                  name="keyboard-arrow-left"
                  size={ICON_SIZE}
                  color="#4B5563"
                />
              </TouchableOpacity>

              <TouchableOpacity>
                <Text className="text-primary text-lg font-bold">{label}</Text>
              </TouchableOpacity>

              {canGoNext ? (
                <TouchableOpacity onPress={() => shiftAnchor(1)}>
                  <MaterialIcons
                    name="keyboard-arrow-right"
                    size={ICON_SIZE}
                    color="#4B5563"
                  />
                </TouchableOpacity>
              ) : (
                <View style={{ width: ICON_SIZE, height: ICON_SIZE }} />
              )}
            </View>
          )}

          {/* Biểu đồ hình tròn */}
          <View className="w-full items-center">
            <View
              style={{
                width: CHART_SIZE,
                height: CHART_SIZE,
                alignSelf: "center",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {chartData.length > 0 ? (
                <PieChart
                  data={chartData}
                  donut
                  radius={CHART_SIZE / 2}
                  innerRadius={(CHART_SIZE * HOLE_RATIO) / 2}
                  showText
                  textColor="white"
                  textSize={14}
                  fontWeight="bold"
                  strokeWidth={4}
                  strokeColor="#333"
                  innerCircleBorderWidth={4}
                  innerCircleBorderColor="#333"
                  showGradient
                  centerLabelComponent={() => (
                    <View style={{ alignItems: "center" }}>
                      <Text className="text-gray-800 font-bold text-xl">
                        {formatMoney(periodTotal)}
                      </Text>
                    </View>
                  )}
                />
              ) : (
                // Placeholder khi không có dữ liệu, tránh gọi PieChart với mảng rỗng
                <View
                  style={{
                    width: CHART_SIZE,
                    height: CHART_SIZE,
                    borderRadius: CHART_SIZE / 2,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "transparent",
                  }}
                >
                  <View
                    style={{
                      width: CHART_SIZE * HOLE_RATIO,
                      height: CHART_SIZE * HOLE_RATIO,
                      borderRadius: (CHART_SIZE * HOLE_RATIO) / 2,
                      backgroundColor: "#fff",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text className="text-gray-400">Chưa có dữ liệu</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Nút thêm (FAB) */}
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: "/giaoDich/chinhSuaGiaoDich",
                params: {
                  type: activeTab === "Chi phí" ? "expense" : "income",
                },
              });
            }}
            className="absolute bottom-4 right-4 bg-primary rounded-full p-4 shadow-lg"
          >
            <MaterialIcons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Danh sách chi tiết theo danh mục */}
        <View className="w-full gap-2">
          {listData.map((item) => (
            <TouchableOpacity
              key={`${item.category}-${item.amount}`}
              onPress={() =>
                router.push({
                  pathname: "/giaoDich",
                  params: {
                    category: item.category,
                    percent: item.percent,
                    amount: String(item.amount),
                  },
                })
              }
              className="flex-row w-full p-2 bg-white rounded-xl shadow items-center"
            >
              <View
                className="w-10 h-10 rounded-full mr-3 items-center justify-center"
                style={{ backgroundColor: item.color ?? "#e5e7eb" }}
              >
                {item.icon ? renderIconByLib(item.icon, "#fff", 18) : null}
              </View>
              <Text className="w-[40%] text-left font-bold text-gray-800">
                {item.category}
              </Text>
              <Text className="w-[20%] text-center font-semibold text-gray-800">
                {item.percent}
              </Text>
              <Text className="w-[30%] text-center font-bold text-gray-800">
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
