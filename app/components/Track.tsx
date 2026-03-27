import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { MealLog } from "../services/logService";
import { palette } from "../theme";

const { width } = Dimensions.get("window");

type TrackScreenProps = {
  allLogs: MealLog[];
};

export default function TrackScreen({ allLogs = [] }: TrackScreenProps) {
  // 1. Process Data into 7-day buckets
  const { chartData, weeklyTotals } = useMemo(() => {
    const days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split("T")[0];
      return {
        dateStr,
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };
    });

    let totalCals = 0;
    allLogs.forEach((log: any) => {
      const logDate = (log.date || log.$createdAt || "").split("T")[0];
      const day = days.find((d) => d.dateStr === logDate);
      if (day) {
        day.calories += Number(log.calories) || 0;
        day.protein += Number(log.protein) || 0;
        day.carbs += Number(log.carbs) || 0;
        day.fat += Number(log.fat) || 0;
        totalCals += Number(log.calories) || 0;
      }
    });

    return { chartData: days, weeklyTotals: { totalCals } };
  }, [allLogs]);

  const commonChartConfig = (color: string) => ({
    backgroundColor: "#1E293B",
    backgroundGradientFrom: "#1E293B",
    backgroundGradientTo: "#1E293B",
    decimalPlaces: 0,
    color: (opacity = 1) => color,
    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
    propsForDots: { r: "5", strokeWidth: "2", stroke: color },
    propsForBackgroundLines: { stroke: "#334155", strokeDasharray: "" },
    fillShadowGradientFrom: color,
    fillShadowGradientTo: color,
    fillShadowGradientFromOpacity: 0.35,
    fillShadowGradientToOpacity: 0,
    useShadowColorFromDataset: false,
  });

  const renderChartCard = (
    title: string,
    key: "calories" | "protein" | "carbs" | "fat",
    color: string,
    icon: string,
    unit: string,
  ) => {
    const dataPoints = chartData.map((d) => d[key]);
    const avg = Math.round(dataPoints.reduce((a, b) => a + b, 0) / 7);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: `${color}20` }]}>
            <MaterialCommunityIcons
              name={icon as any}
              size={20}
              color={color}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSubtitle}>Past 7 days</Text>
          </View>
          <View style={styles.avgBadge}>
            <Text style={[styles.avgText, { color }]}>
              {avg}
              {unit} avg
            </Text>
          </View>
        </View>

        <LineChart
          data={{
            labels: chartData.map((d) => d.label),
            datasets: [
              { data: dataPoints, color: () => color, strokeWidth: 3 },
            ],
          }}
          width={width - 40}
          height={180}
          chartConfig={commonChartConfig(color)}
          bezier
          fromZero
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={false}
          withVerticalLines={false}
        />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>
          Progress <Text style={{ color: palette.primary }}>Analytics</Text>
        </Text>
        <Text style={styles.headerSub}>
          Tracking your journey over the last week
        </Text>
      </View>

      {/* Summary Highlight */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Weekly Energy</Text>
          <Text style={styles.summaryValue}>
            {weeklyTotals.totalCals}{" "}
            <Text style={styles.summaryUnit}>kcal</Text>
          </Text>
        </View>
        <View
          style={[
            styles.summaryItem,
            { borderLeftWidth: 1, borderColor: "#334155" },
          ]}
        >
          <Text style={styles.summaryLabel}>Logs Found</Text>
          <Text style={styles.summaryValue}>
            {allLogs.length} <Text style={styles.summaryUnit}>entries</Text>
          </Text>
        </View>
      </View>

      {/* Charts */}
      {renderChartCard("Calories", "calories", palette.primary, "fire", "kcal")}
      {renderChartCard("Protein", "protein", "#10B981", "food-drumstick", "g")}
      {renderChartCard("Carbs", "carbs", "#3B82F6", "bread-slice", "g")}
      {renderChartCard("Fats", "fat", "#F59E0B", "opacity", "g")}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  content: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 120 },
  headerSection: { marginBottom: 25 },
  headerTitle: { fontSize: 32, fontWeight: "900", color: "#FFF" },
  headerSub: { color: "#94A3B8", fontSize: 14, marginTop: 4 },
  summaryRow: {
    flexDirection: "row",
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#334155",
  },
  summaryItem: { flex: 1, paddingHorizontal: 10 },
  summaryLabel: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  summaryValue: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
  },
  summaryUnit: { fontSize: 12, fontWeight: "400", color: "#64748B" },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#334155",
    // Shadow for iOS/Android
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  cardSubtitle: { color: "#94A3B8", fontSize: 12 },
  avgBadge: {
    backgroundColor: "#0F172A",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  avgText: { fontSize: 12, fontWeight: "700" },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    marginLeft: -15,
    paddingRight: 40,
  },
});
