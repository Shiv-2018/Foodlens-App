import { useEffect, useState, useCallback } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
    StatusBar,
    RefreshControl
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import type { Models } from "react-native-appwrite";
import { LogOut, User as UserIcon } from "lucide-react-native";

// Components
import Header from "./components/Header";
import UploadCard from "./components/UploadCard";
import FoodInfoCard from "./components/FoodInfoCard";
import DailyProgress from "./components/DailyProgress"; // New Component
import Footer from "./components/Footer";
import CameraModal from "./components/CameraModal";

// Logic
import { useFoodLens } from "./hooks/useFoodLens";
import { restoreSessionUser, signOut } from "./services/authService";
import { logMeal, getDailySummary } from "./services/logService"; // New Service
import { palette, spacing } from "./theme";
import { UserPrefs } from "./types/user";

export default function Index() {
    const router = useRouter();
    const [checkingSession, setCheckingSession] = useState(true);
    const [currentUser, setCurrentUser] = useState<Models.User<UserPrefs> | null>(null);
    const [dailyStats, setDailyStats] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [refreshing, setRefreshing] = useState(false);

    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    const {
        imageUri,
        canAnalyze,
        loading,
        result,
        cameraOpen,
        pickFromGallery,
        openCamera,
        identifyFood,
        handleImageCaptured,
        closeCamera,
    } = useFoodLens(apiKey);

    // Initial Auth Check
    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const user = await restoreSessionUser();
                if (active) {
                    if (user) {
                        setCurrentUser(user);
                        fetchDailyStats(user.$id);
                    } else {
                        router.replace("/auth");
                    }
                }
            } catch {
                if (active) router.replace("/auth");
            } finally {
                if (active) setCheckingSession(false);
            }
        })();
        return () => { active = false; };
    }, []);

    // Fetch Stats helper
    const fetchDailyStats = async (userId: string) => {
        try {
            const summary = await getDailySummary(userId);
            setDailyStats(summary);
        } catch (e) {
            console.log("Failed to fetch stats", e);
        }
    };

    // Refresh Logic
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        if (currentUser) {
            await Promise.all([
                restoreSessionUser().then(setCurrentUser),
                fetchDailyStats(currentUser.$id)
            ]);
        }
        setRefreshing(false);
    }, [currentUser]);

    // Handle Adding Meal
    const handleLogMeal = async (servings: number) => {
        if (!currentUser || !result || "error" in result) return;
        try {
            await logMeal(currentUser.$id, result, servings, imageUri || undefined);
            // Refresh stats immediately after logging
            await fetchDailyStats(currentUser.$id);
            Alert.alert("Success", "Meal logged to your daily summary.");
        } catch (error: any) {
            Alert.alert("Error", "Could not log meal. Please try again.");
        }
    };

    // Sign Out
    const handleSignOut = async () => { /* ... same as before ... */ };

    if (checkingSession) return null; // Or loading spinner
    if (!currentUser) return null;

    const displayGoal = currentUser.prefs?.fitnessGoal
        ? currentUser.prefs.fitnessGoal.replace("_", " ").toUpperCase()
        : "MAINTENANCE";

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="light-content" />
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.primary} />}
            >
                <View style={styles.topBar}>
                    <Pressable style={styles.userSection} onPress={() => router.push("/profile")}>
                        <View style={styles.avatarCircle}><UserIcon size={20} color={palette.primary} /></View>
                        <View>
                            <Text style={styles.greeting}>Hello, {currentUser.name.split(' ')[0]}</Text>
                            <Text style={styles.statusLabel}>{displayGoal}</Text>
                        </View>
                    </Pressable>
                    <Pressable style={styles.signOutIconButton} onPress={handleSignOut}>
                        <LogOut size={22} color={palette.textSecondary} />
                    </Pressable>
                </View>

                {/* New Daily Summary Widget */}
                <DailyProgress
                    current={dailyStats}
                    goal={{
                        calories: currentUser.prefs?.dailyCalorieGoal || "2000",
                        type: currentUser.prefs?.fitnessGoal || "maintenance"
                    }}
                />

                <Header />

                <View style={styles.mainContent}>
                    <UploadCard
                        imageUri={imageUri}
                        canAnalyze={canAnalyze}
                        loading={loading}
                        onPickFromGallery={pickFromGallery}
                        onOpenCamera={openCamera}
                        onIdentify={identifyFood}
                    />

                    {/* Pass the log handler */}
                    <FoodInfoCard result={result} onLogMeal={handleLogMeal} />
                </View>

                <Footer />
            </ScrollView>
            <CameraModal visible={cameraOpen} onRequestClose={closeCamera} onCaptured={handleImageCaptured} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: palette.background, paddingVertical: spacing.xxxl},
    container: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
    topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.xxl, marginBottom: spacing.md },
    userSection: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(37, 99, 235, 0.15)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(37, 99, 235, 0.2)" },
    greeting: { color: palette.textPrimary, fontWeight: "900", fontSize: 20 },
    statusLabel: { color: palette.primary, fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
    signOutIconButton: { padding: 10, backgroundColor: palette.surface, borderRadius: 14, borderWidth: 1, borderColor: palette.border },
    mainContent: { gap: spacing.xxl, marginBottom: spacing.xxxl },
});