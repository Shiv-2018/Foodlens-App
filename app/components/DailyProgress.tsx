import { StyleSheet, Text, View } from "react-native";
import { palette } from "../theme";
import { FitnessGoal } from "../types/user";
import { getMacroTargets } from "../utils/nutrition";

type Props = {
  current: { calories: number; protein: number; carbs: number; fat: number };
  goal: { calories: string; type: FitnessGoal };
};

export default function DailyProgress({ current, goal }: Props) {
  const calorieTarget = parseInt(goal.calories) || 2000;
  const targets = getMacroTargets(calorieTarget, goal.type);

  const getProgress = (val: number, target: number) => {
    const pct = Math.min((val / target) * 100, 100) || 0;
    return `${pct}%`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Daily Summary</Text>
          <Text style={styles.dateLabel}>Nutrition Overview</Text>
        </View>
        <View style={styles.goalContainer}>
          <Text style={styles.goalText}>
            <Text style={styles.currentCalText}>{current.calories}</Text>
            <Text style={styles.targetCalText}> / {calorieTarget} kcal</Text>
          </Text>
        </View>
      </View>

      {/* Main Calorie Progress Bar */}
      <View style={styles.mainBarBg}>
        <View
          style={[
            styles.mainBarFill,
            {
              width: getProgress(current.calories, calorieTarget),
              backgroundColor:
                current.calories > calorieTarget ? "#EF4444" : palette.primary,
            },
          ]}
        />
      </View>

      <View style={styles.divider} />

      {/* Macros Section */}
      <View style={styles.macroRow}>
        <MacroItem
          label="Protein"
          current={current.protein}
          target={targets.protein}
          color="#10B981" // Matched to your HomeView Protein color
        />
        <MacroItem
          label="Carbs"
          current={current.carbs}
          target={targets.carbs}
          color="#3B82F6" // Matched to your HomeView Carbs color
        />
        <MacroItem
          label="Fat"
          current={current.fat}
          target={targets.fat}
          color="#F59E0B" // Matched to your HomeView Fat color
        />
      </View>
    </View>
  );
}

const MacroItem = ({ label, current, target, color }: any) => (
  <View style={styles.macroItem}>
    <Text style={styles.macroLabel}>{label}</Text>
    <Text style={styles.macroValue}>
      {current}
      <Text style={styles.unitText}>/{target}g</Text>
    </Text>
    {/* Explicit width added to the container below */}
    <View style={styles.miniBarBg}>
      <View
        style={[
          styles.miniBarFill,
          {
            backgroundColor: color,
            width: `${Math.min((current / target) * 100, 100) || 0}%`,
          },
        ]}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  title: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  dateLabel: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  goalContainer: {
    alignItems: "flex-end",
  },
  goalText: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currentCalText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 16,
  },
  targetCalText: {
    color: "#94A3B8",
    fontWeight: "600",
    fontSize: 13,
  },
  mainBarBg: {
    height: 10,
    backgroundColor: "#0F172A", // Contrast background
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 16,
  },
  mainBarFill: {
    height: "100%",
    borderRadius: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "#334155",
    marginBottom: 16,
    opacity: 0.5,
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "center", // Centers the row
    gap: 20, // Clean spacing between the three items
    marginTop: 8,
  },
  macroItem: {
    alignItems: "center", // Centers text and bar
    width: 85, // Fixed width ensures bars are visible and uniform
  },
  macroLabel: {
    color: "#94A3B8",
    fontSize: 10,
    marginBottom: 4,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  macroValue: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  unitText: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
  },
  miniBarBg: {
    height: 5,
    width: "100%", // Fills the 85px width of the macroItem
    backgroundColor: "#0F172A",
    borderRadius: 3,
    overflow: "hidden",
  },
  miniBarFill: {
    height: "100%",
    borderRadius: 3,
  },
});
