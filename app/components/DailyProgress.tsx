import { StyleSheet, Text, View } from "react-native";
import { palette, radii, spacing } from "../theme";
import { parseNutritionValue, getMacroTargets } from "../utils/nutrition";
import { FitnessGoal } from "../types/user";

type Props = {
    current: { calories: number; protein: number; carbs: number; fat: number };
    goal: { calories: string; type: FitnessGoal };
};

export default function DailyProgress({ current, goal }: Props) {
    // Calculate targets based on user preference
    const calorieTarget = parseInt(goal.calories) || 2000;
    const targets = getMacroTargets(calorieTarget, goal.type);

    // Helper for progress bar width
    const getProgress = (val: number, target: number) => {
        const pct = Math.min((val / target) * 100, 100);
        return `${pct}%`;
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title}>Daily Summary</Text>
                <Text style={styles.goalText}>{current.calories} / {calorieTarget} kcal</Text>
            </View>

            {/* Calorie Bar */}
            <View style={styles.mainBarBg}>
                <View style={[styles.mainBarFill, { width: getProgress(current.calories, calorieTarget) }]} />
            </View>

            {/* Macros */}
            <View style={styles.macroRow}>
                <MacroItem label="Protein" current={current.protein} target={targets.protein} color="#8B5CF6" />
                <MacroItem label="Carbs" current={current.carbs} target={targets.carbs} color="#3B82F6" />
                <MacroItem label="Fat" current={current.fat} target={targets.fat} color="#F59E0B" />
            </View>
        </View>
    );
}

const MacroItem = ({ label, current, target, color }: any) => (
    <View style={styles.macroItem}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValue}>{current} / {target}g</Text>
        <View style={styles.miniBarBg}>
            <View style={[styles.miniBarFill, { backgroundColor: color, width: `${Math.min((current/target)*100, 100)}%` }]} />
        </View>
    </View>
);

const styles = StyleSheet.create({
    card: { backgroundColor: palette.surface, borderRadius: radii.lg, padding: spacing.xl, borderWidth: 1, borderColor: palette.border, marginBottom: spacing.lg },
    header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12, alignItems: "center" },
    title: { color: palette.textPrimary, fontWeight: "800", fontSize: 16 },
    goalText: { color: palette.textMuted, fontWeight: "600" },
    mainBarBg: { height: 12, backgroundColor: palette.surfaceAlt, borderRadius: 6, overflow: "hidden", marginBottom: 20 },
    mainBarFill: { height: "100%", backgroundColor: palette.primary, borderRadius: 6 },
    macroRow: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
    macroItem: { flex: 1 },
    macroLabel: { color: palette.textSecondary, fontSize: 12, marginBottom: 2 },
    macroValue: { color: palette.textPrimary, fontSize: 13, fontWeight: "700", marginBottom: 6 },
    miniBarBg: { height: 4, backgroundColor: palette.surfaceAlt, borderRadius: 2 },
    miniBarFill: { height: "100%", borderRadius: 2 },
});