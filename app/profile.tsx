import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Check, Flame, Dumbbell, Activity, TrendingUp, Target } from "lucide-react-native";
import { getCurrentUser, updateUserPreferences } from "./services/authService";
import { palette, radii, spacing } from "./theme";
import { FitnessGoal, UserPrefs } from "./types/user";

const GOAL_OPTIONS: { id: FitnessGoal; label: string; icon: any; desc: string }[] = [
    { id: "weight_loss", label: "Weight Loss", icon: Flame, desc: "Deficit for shedding pounds" },
    { id: "muscle_gain", label: "Muscle Gain", icon: Dumbbell, desc: "Surplus for building mass" },
    { id: "endurance", label: "Endurance", icon: Activity, desc: "Fuel for long performance" },
    { id: "weight_gain", label: "Weight Gain", icon: TrendingUp, desc: "Healthy surplus" },
    { id: "maintenance", label: "Maintenance", icon: Target, desc: "Keep current weight" },
];

export default function ProfileScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [calorieGoal, setCalorieGoal] = useState("");
    const [selectedGoal, setSelectedGoal] = useState<FitnessGoal>("maintenance");
    const [userName, setUserName] = useState("");

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            const user = await getCurrentUser();
            setUserName(user.name);
            // Appwrite prefs are available here
            if (user.prefs) {
                if (user.prefs.dailyCalorieGoal) setCalorieGoal(user.prefs.dailyCalorieGoal);
                if (user.prefs.fitnessGoal) setSelectedGoal(user.prefs.fitnessGoal);
            }
        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!calorieGoal) return Alert.alert("Required", "Please set a daily calorie goal.");

        try {
            setSaving(true);
            const prefs: UserPrefs = {
                dailyCalorieGoal: calorieGoal,
                fitnessGoal: selectedGoal,
                isOnboarded: true
            };

            await updateUserPreferences(prefs);
            Alert.alert("Success", "Profile updated successfully!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safe}>
                <ActivityIndicator size="large" color={palette.primary} style={{ marginTop: 50 }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={palette.textPrimary} />
                </Pressable>
                <Text style={styles.headerTitle}>My Goals</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content}>

                    {/* User Details */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Account Name</Text>
                        <View style={styles.readOnlyField}>
                            <Text style={styles.readOnlyText}>{userName}</Text>
                        </View>
                    </View>

                    {/* Calorie Goal Input */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Daily Calorie Target</Text>
                        <View style={styles.inputWrap}>
                            <TextInput
                                style={styles.input}
                                value={calorieGoal}
                                onChangeText={(text) => setCalorieGoal(text.replace(/[^0-9]/g, ""))}
                                keyboardType="numeric"
                                placeholder="e.g. 2000"
                                placeholderTextColor={palette.textMuted}
                            />
                            <Text style={styles.unitText}>kcal</Text>
                        </View>
                    </View>

                    {/* Fitness Goal Selector */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Primary Goal</Text>
                        <View style={styles.optionsGrid}>
                            {GOAL_OPTIONS.map((option) => {
                                const isSelected = selectedGoal === option.id;
                                const Icon = option.icon;
                                return (
                                    <Pressable
                                        key={option.id}
                                        style={[styles.optionCard, isSelected && styles.optionSelected]}
                                        onPress={() => setSelectedGoal(option.id)}
                                    >
                                        <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
                                            <Icon size={20} color={isSelected ? "#FFF" : palette.textSecondary} />
                                        </View>
                                        <View style={styles.optionInfo}>
                                            <Text style={[styles.optionTitle, isSelected && styles.textSelected]}>{option.label}</Text>
                                            <Text style={styles.optionDesc}>{option.desc}</Text>
                                        </View>
                                        {isSelected && <Check size={18} color={palette.primary} />}
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                    {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: palette.background },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: spacing.xl },
    backBtn: { padding: 8, marginLeft: -8 },
    headerTitle: { fontSize: 20, fontWeight: "800", color: palette.textPrimary },
    content: { padding: spacing.xl, gap: spacing.xxl },
    section: { gap: spacing.sm },
    label: { color: palette.textSecondary, fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
    readOnlyField: { padding: spacing.lg, backgroundColor: palette.surface, borderRadius: radii.md, borderWidth: 1, borderColor: palette.border },
    readOnlyText: { color: palette.textMuted, fontSize: 16 },
    inputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: palette.surface, borderRadius: radii.md, borderWidth: 1, borderColor: palette.border, paddingHorizontal: spacing.lg },
    input: { flex: 1, color: palette.textPrimary, fontSize: 24, fontWeight: "700", paddingVertical: spacing.lg },
    unitText: { color: palette.textMuted, fontSize: 16, fontWeight: "600" },
    optionsGrid: { gap: spacing.md },
    optionCard: { flexDirection: "row", alignItems: "center", padding: spacing.lg, backgroundColor: palette.surface, borderRadius: radii.md, borderWidth: 1, borderColor: palette.border, gap: spacing.md },
    optionSelected: { borderColor: palette.primary, backgroundColor: "rgba(37, 99, 235, 0.1)" },
    iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: palette.surfaceAlt, justifyContent: "center", alignItems: "center" },
    iconBoxSelected: { backgroundColor: palette.primary },
    optionInfo: { flex: 1 },
    optionTitle: { color: palette.textPrimary, fontWeight: "700", fontSize: 16 },
    optionDesc: { color: palette.textMuted, fontSize: 13 },
    textSelected: { color: palette.primary },
    footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: palette.border, backgroundColor: palette.background },
    saveBtn: { backgroundColor: palette.primary, height: 56, borderRadius: radii.lg, justifyContent: "center", alignItems: "center" },
    saveBtnText: { color: "#FFF", fontSize: 18, fontWeight: "800" },
});