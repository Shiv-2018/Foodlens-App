import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { palette, spacing } from "../theme";

interface HomeViewProps {
  currentUser: any;
  dailyStats: any;
  dailyLogs: any[];
  onRefresh: () => Promise<void>;
  refreshing: boolean;
  setActiveTab: (tab: any) => void;
}

export const HomeView = ({
  currentUser,
  dailyStats,
  dailyLogs,
  setActiveTab,
}: HomeViewProps) => {
  const targets = { protein: 175, carbs: 225, fat: 44 };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* MAIN TRACKER CARD */}
      <View style={styles.mainCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headerIconContainer}>
            <MaterialCommunityIcons
              name="silverware-fork-knife"
              size={20}
              color={palette.primary}
            />
          </View>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={styles.cardTitle}>Track Food</Text>
            <Text style={styles.cardSubtitle}>Goal: 2000 kcal</Text>
          </View>
          <Pressable onPress={() => setActiveTab("Lens")} hitSlop={15}>
            <Ionicons
              name="camera-outline"
              size={26}
              color={palette.textPrimary}
            />
          </Pressable>
        </View>

        <View style={styles.macroRow}>
          <MacroCircle
            label="Protein"
            current={dailyStats.protein}
            target={targets.protein}
            color="#10B981"
          />
          <MacroCircle
            label="Carbs"
            current={dailyStats.carbs}
            target={targets.carbs}
            color="#3B82F6"
          />
          <MacroCircle
            label="Fat"
            current={dailyStats.fat}
            target={targets.fat}
            color="#F59E0B"
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Today's Logs</Text>

      {dailyLogs.map((log, index) => {
        const logDate = new Date(log.$createdAt);
        const timeStr = logDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        const timeParts = timeStr.split(" ");
        const timeDisplay = timeParts[0] || "--:--";
        const amPmDisplay = (timeParts[1] || "").toLowerCase();

        return (
          <View key={log.$id || index} style={styles.timelineItem}>
            {/* LEFT TIME COLUMN */}
            <View style={styles.timeColumn}>
              <Text style={styles.timeText}>{timeDisplay}</Text>
              {amPmDisplay ? (
                <Text style={styles.amPmText}>{amPmDisplay}</Text>
              ) : null}
              {index !== dailyLogs.length - 1 && (
                <View style={styles.verticalLine} />
              )}
            </View>

            {/* RIGHT CONTENT CARD */}
            <View style={styles.logCard}>
              <View style={styles.logHeaderRow}>
                <View style={styles.foodIconCircle}>
                  <MaterialCommunityIcons
                    name="food-apple"
                    size={18}
                    color="#FF9F43"
                  />
                </View>
                <Text style={styles.logFoodName} numberOfLines={1}>
                  {log.name}
                </Text>
              </View>

              <View style={styles.caloriesRow}>
                <Text style={styles.logCalAmount}>
                  {Math.round(log.calories)}
                </Text>
                <Text style={styles.logCalLabel}>/275 Cal Eaten</Text>
              </View>

              <View style={styles.logDivider} />

              <View style={styles.innerMacroRow}>
                <LogMacroCircle
                  label="Protein"
                  value={log.protein}
                  target={30}
                  color="#10B981"
                />
                <LogMacroCircle
                  label="Fat"
                  value={log.fat}
                  target={15}
                  color="#F59E0B"
                />
                <LogMacroCircle
                  label="Carbs"
                  value={log.carbs}
                  target={40}
                  color="#3B82F6"
                />
                <LogMacroCircle
                  label="Fiber"
                  value={2}
                  target={10}
                  color="#A78BFA"
                />
              </View>

              <Pressable style={styles.insightBtn}>
                <Ionicons name="sparkles-outline" size={14} color="#00D261" />
                <Text style={styles.insightBtnText}>View Insight</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const MacroCircle = ({ label, current, target, color }: any) => {
  const percentage = Math.min(Math.round((current / target) * 100), 100) || 0;
  return (
    <View style={styles.circleWrapper}>
      <View
        style={[styles.circleBase, { borderColor: "rgba(255,255,255,0.05)" }]}
      >
        <View
          style={[
            styles.circleProgress,
            {
              borderColor: color,
              transform: [{ rotate: `${percentage * 3.6 - 45}deg` }],
            },
          ]}
        />
        <Text style={styles.circlePercentage}>{percentage}%</Text>
      </View>
      <Text style={styles.circleLabel}>{label}</Text>
    </View>
  );
};

const LogMacroCircle = ({ label, value, target, color }: any) => {
  const percentage = Math.min(value / target, 1);
  return (
    <View style={styles.innerCircleWrapper}>
      <View style={styles.innerCircleBase}>
        <View
          style={[
            styles.innerCircleProgress,
            {
              borderColor: color,
              transform: [{ rotate: `${percentage * 360 - 45}deg` }],
            },
          ]}
        />
        <MaterialCommunityIcons
          name="leaf"
          size={10}
          color={palette.textMuted}
        />
      </View>
      <Text style={styles.innerLabel}>{label}</Text>
      <Text style={styles.innerValue}>{value}g</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A", // Slightly deeper dark for better contrast
  },
  contentContainer: {
    paddingTop: 60, // Generous top padding for status bar area
    paddingHorizontal: 20, // Clean side margins
    paddingBottom: 40, // Space at bottom for navigation bar
  },
  mainCard: {
    backgroundColor: "#1E293B",
    borderRadius: 24,
    padding: 24, // Increased internal padding
    borderWidth: 1,
    borderColor: "#334155",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  headerIconContainer: {
    padding: 10,
    backgroundColor: "#334155",
    borderRadius: 12,
  },
  cardTitle: { fontSize: 20, fontWeight: "800", color: "#FFF" },
  cardSubtitle: { fontSize: 13, color: "#94A3B8", marginTop: 2 },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between", // Better distribution
    paddingHorizontal: 4,
  },
  circleWrapper: { alignItems: "center" },
  circleBase: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  circleProgress: {
    position: "absolute",
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
  },
  circlePercentage: { fontSize: 15, fontWeight: "900", color: "#FFF" },
  circleLabel: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 10,
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFF",
    marginTop: 36,
    marginBottom: 24,
  },
  timelineItem: { flexDirection: "row", marginBottom: 24 },
  timeColumn: { width: 65, alignItems: "center", paddingTop: 8 },
  timeText: { fontSize: 15, fontWeight: "800", color: "#FFF" },
  amPmText: { fontSize: 12, color: "#64748B", fontWeight: "600", marginTop: 2 },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#334155",
    marginVertical: 12,
    borderRadius: 1,
  },

  logCard: {
    flex: 1,
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  logHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  foodIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logFoodName: { fontSize: 17, fontWeight: "700", color: "#FFF", flex: 1 },
  caloriesRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 14,
  },
  logCalAmount: { fontSize: 28, fontWeight: "900", color: "#FFF" },
  logCalLabel: {
    fontSize: 14,
    color: "#94A3B8",
    marginLeft: 6,
    fontWeight: "500",
  },
  logDivider: { height: 1, backgroundColor: "#334155", marginVertical: 16 },

  innerMacroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  innerCircleWrapper: { alignItems: "center" },
  innerCircleBase: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2.5,
    borderColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircleProgress: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2.5,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
  },
  innerLabel: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 6,
    fontWeight: "600",
  },
  innerValue: { fontSize: 12, fontWeight: "800", color: "#FFF", marginTop: 1 },

  insightBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 210, 97, 0.1)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  insightBtnText: {
    color: "#00D261",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 8,
  },
});
