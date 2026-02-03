import { useState } from "react";
import { StyleSheet, Text, View, Pressable, TextInput, ActivityIndicator } from "react-native";
import { palette, radii, spacing } from "../theme";
import { ResultState } from "../types/food";
import { Info, Utensils, Plus, Check } from "lucide-react-native";
import { parseNutritionValue } from "../utils/nutrition";

// Add props for logging
type Props = {
    result: ResultState;
    onLogMeal?: (servings: number) => Promise<void>;
};

export default function FoodInfoCard({ result, onLogMeal }: Props) {
    const [servings, setServings] = useState("1");
    const [logging, setLogging] = useState(false);
    const [logged, setLogged] = useState(false);

    if (!result) return (
        <View style={styles.placeholder}>
            <Info size={24} color={palette.textMuted} />
            <Text style={styles.placeholderText}>Results will appear here after analysis.</Text>
        </View>
    );

    if ("error" in result) return (
        <View style={styles.errorBox}>
            <Text style={styles.errorText}>{result.error}</Text>
        </View>
    );

    const servingCount = parseFloat(servings) || 0;
    const calories = parseNutritionValue(result.nutritionalInfo.calories) * servingCount;

    const handleLog = async () => {
        if (!onLogMeal || logged) return;
        setLogging(true);
        await onLogMeal(servingCount);
        setLogging(false);
        setLogged(true);
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Utensils size={20} color={palette.primary} />
                <Text style={styles.name}>{result.name}</Text>
            </View>
            <Text style={styles.cuisine}>{result.cuisine} Cuisine</Text>

            <View style={styles.divider} />

            <View style={styles.rowBetween}>
                <Text style={styles.sectionLabel}>Nutritional Summary</Text>
                {/* Dynamic Calorie Display */}
                <Text style={styles.totalCals}>{Math.round(calories)} kcal</Text>
            </View>

            <View style={styles.grid}>
                {Object.entries(result.nutritionalInfo).map(([key, val]) => {
                    const numVal = parseNutritionValue(val);
                    return (
                        <View key={key} style={styles.gridItem}>
                            <Text style={styles.gridKey}>{key}</Text>
                            {/* Dynamically scale the displayed macro values */}
                            <Text style={styles.gridVal}>
                                {key === "calories" ? Math.round(calories) : Math.round(numVal * servingCount)}
                                {val.replace(/[0-9.]/g, '') /* keep unit */}
                            </Text>
                        </View>
                    );
                })}
            </View>

            <View style={styles.divider} />

            {/* Input Section */}
            <View style={styles.actionRow}>
                <View style={styles.inputWrap}>
                    <Text style={styles.inputLabel}>Servings</Text>
                    <TextInput
                        style={styles.input}
                        value={servings}
                        onChangeText={setServings}
                        keyboardType="numeric"
                        selectTextOnFocus
                    />
                </View>

                <Pressable
                    style={[styles.logBtn, logged && styles.successBtn]}
                    onPress={handleLog}
                    disabled={logging || logged}
                >
                    {logging ? (
                        <ActivityIndicator color="#FFF" size="small" />
                    ) : logged ? (
                        <>
                            <Check size={18} color="#FFF" />
                            <Text style={styles.logBtnText}>Added</Text>
                        </>
                    ) : (
                        <>
                            <Plus size={18} color="#FFF" />
                            <Text style={styles.logBtnText}>Add to Diary</Text>
                        </>
                    )}
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: palette.surface, borderRadius: radii.lg, padding: spacing.xl, borderWidth: 1, borderColor: palette.border },
    placeholder: { padding: 40, alignItems: "center", gap: 12, opacity: 0.6 },
    placeholderText: { color: palette.textMuted, textAlign: "center" },
    header: { flexDirection: "row", alignItems: "center", gap: 10 },
    name: { color: palette.textPrimary, fontSize: 24, fontWeight: "900", flex: 1 },
    cuisine: { color: palette.primary, fontWeight: "700", textTransform: "uppercase", fontSize: 12, marginTop: 4 },
    divider: { height: 1, backgroundColor: palette.border, marginVertical: 16 },
    sectionLabel: { color: palette.textSecondary, fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1 },
    rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
    totalCals: { color: palette.primary, fontWeight: "900", fontSize: 16 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    gridItem: { backgroundColor: palette.surfaceAlt, padding: 12, borderRadius: radii.sm, minWidth: "45%", flex: 1, borderWidth: 1, borderColor: palette.border },
    gridKey: { color: palette.textMuted, fontSize: 10, textTransform: "capitalize" },
    gridVal: { color: palette.textPrimary, fontWeight: "800", fontSize: 14, marginTop: 2 },
    errorBox: { backgroundColor: palette.errorBg, padding: 16, borderRadius: radii.md },
    errorText: { color: palette.errorTitle, fontWeight: "600" },

    // New Styles for Actions
    actionRow: { flexDirection: "row", gap: 12, alignItems: "flex-end" },
    inputWrap: { width: 80 },
    inputLabel: { color: palette.textSecondary, fontSize: 11, marginBottom: 4 },
    input: { backgroundColor: palette.surfaceAlt, color: palette.textPrimary, padding: 12, borderRadius: radii.md, borderWidth: 1, borderColor: palette.border, fontWeight: "700", textAlign: "center" },
    logBtn: { flex: 1, backgroundColor: palette.primary, height: 44, borderRadius: radii.md, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
    successBtn: { backgroundColor: "#059669" },
    logBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 }
});