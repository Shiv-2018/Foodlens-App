import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { palette } from "../theme";

const { width } = Dimensions.get("window");

type TrackScreenProps = {
  allLogs: any[];
};

export default function TrackScreen({ allLogs = [] }: TrackScreenProps) {
  const chartData = useMemo(() => {
    // 1. Generate last 7 days skeleton
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
        water: 0,
        sleep: 0,
        burnt: 0,
      };
    });

    // 2. Map through combined logs (Meals + Metrics)
    allLogs.forEach((log: any) => {
      // Use $createdAt for Appwrite timestamps
      const logDate = (log.date || log.$createdAt || "").split("T")[0];
      const day = days.find((d) => d.dateStr === logDate);

      if (day) {
        if (log.metricType) {
          // Logic for Metrics from HomeView
          const value = Number(log.value) || 0;
          switch (log.metricType) {
            case "water":
              day.water += value;
              break;
            case "sleep":
              day.sleep += value;
              break;
            case "workout":
              // For workouts, 'value' is already the calorie burn
              day.burnt += value;
              break;
            case "steps":
              // 0.04 kcal per step as per your Dashboard logic
              day.burnt += value * 0.04;
              break;
          }
        } else {
          // Logic for Meal Logs
          day.calories += Number(log.calories) || 0;
          day.protein += Number(log.protein) || 0;
          day.carbs += Number(log.carbs) || 0;
          day.fat += Number(log.fat) || 0;
        }
      }
    });

    return days;
  }, [allLogs]);

  const commonChartConfig = (color: string) => ({
    backgroundColor: "#1E293B",
    backgroundGradientFrom: "#1E293B",
    backgroundGradientTo: "#1E293B",
    decimalPlaces: 1,
    color: (opacity = 1) => color,
    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
    propsForDots: { r: "4", strokeWidth: "2", stroke: color },
    propsForBackgroundLines: { stroke: "#334155", strokeDasharray: "" },
    fillShadowGradientFrom: color,
    fillShadowGradientTo: color,
    fillShadowGradientFromOpacity: 0.3,
    fillShadowGradientToOpacity: 0,
  });

  const renderChartCard = (
    title: string,
    key: keyof (typeof chartData)[0],
    color: string,
    icon: string,
    unit: string,
  ) => {
    const dataPoints = chartData.map((d: any) => Number(d[key]) || 0);
    const hasData = dataPoints.some((v) => v > 0);
    const avg = (dataPoints.reduce((a, b) => a + b, 0) / 7).toFixed(
      hasData ? 1 : 0,
    );

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
            <Text style={styles.cardSubtitle}>
              {hasData
                ? `Weekly Avg: ${avg}${unit}`
                : "No data recorded this week"}
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
          width={width - 50}
          height={160}
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
      <Text style={styles.header}>
        Health <Text style={{ color: palette.primary }}>Insights</Text>
      </Text>

      {/* Fitness Section */}
      <Text style={styles.sectionHeader}>Activity & Lifestyle</Text>
      {renderChartCard(
        "Calories Burnt",
        "burnt",
        "#F59E0B",
        "fire-circle",
        " kcal",
      )}
      {renderChartCard("Water Intake", "water", "#3B82F6", "water", " L")}
      {renderChartCard(
        "Sleep Duration",
        "sleep",
        "#8B5CF6",
        "weather-night",
        " hrs",
      )}

      {/* Nutrition Section */}
      <View style={styles.divider} />
      <Text style={styles.sectionHeader}>Nutrition Trends</Text>
      {renderChartCard(
        "Calories Eaten",
        "calories",
        palette.primary,
        "food-apple",
        " kcal",
      )}
      {renderChartCard("Protein", "protein", "#10B981", "food-drumstick", "g")}
      {renderChartCard("Carbs", "carbs", "#3B82F6", "bread-slice", "g")}
      {renderChartCard("Fats", "fat", "#F59E0B", "opacity", "g")}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  content: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 120 },
  header: { fontSize: 32, fontWeight: "900", color: "#FFF", marginBottom: 25 },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 15,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  divider: { height: 1, backgroundColor: "#334155", marginVertical: 30 },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  cardSubtitle: { color: "#64748B", fontSize: 13, marginTop: 2 },
  chart: { marginVertical: 8, borderRadius: 16, marginLeft: -15 },
});
