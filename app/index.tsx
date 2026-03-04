import { useRouter } from "expo-router";
import { LogOut, User as UserIcon } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { Models } from "react-native-appwrite";

import AddFood from "./components/AddFood";
import { BottomNav, TabType } from "./components/BottomNav";
import DailyProgress from "./components/DailyProgress";
import { HomeView } from "./components/HomeDashboard";
import { restoreSessionUser, signOut } from "./services/authService";
import { getDailySummary } from "./services/logService";
import { palette, spacing } from "./theme";
import { UserPrefs } from "./types/user";
import { getGoalLabel } from "./utils/nutrition";

export default function Index() {
  const router = useRouter();

  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType>("Home");

  const [currentUser, setCurrentUser] = useState<Models.User<UserPrefs> | null>(
    null,
  );
  const [dailyStats, setDailyStats] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [dailyLogs, setDailyLogs] = useState<any[]>([]); // New state for timeline
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const user = await restoreSessionUser();
        if (active && user) {
          setCurrentUser(user);
          fetchDailyStats(user.$id);
        }
      } catch (e) {
        console.log("Error fetching initial data", e);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const fetchDailyStats = async (userId: string) => {
    try {
      // Casting to any to fix the "Property does not exist" error in your screenshot
      const summary = (await getDailySummary(userId)) as any;

      // Mapping based on your DEBUG log: data is in .logs
      const logs = summary.logs || [];
      setDailyLogs(logs);

      setDailyStats({
        calories: summary.calories || 0,
        protein: summary.protein || 0,
        carbs: summary.carbs || 0,
        fat: summary.fat || 0,
      });
    } catch (e) {
      console.error("Failed to fetch stats", e);
    }
  };
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (currentUser) {
      await Promise.all([
        restoreSessionUser().then(setCurrentUser),
        fetchDailyStats(currentUser.$id),
      ]);
    }
    setRefreshing(false);
  }, [currentUser]);

  const confirmSignOut = async () => {
    setShowLogoutModal(false);
    await signOut();
    router.replace("/auth/signin");
  };

  if (!currentUser) return null;

  const displayGoal = getGoalLabel(
    currentUser.prefs?.fitnessGoal,
  ).toUpperCase();

  const renderTabContent = () => {
    switch (activeTab) {
      case "Home":
        return (
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={palette.primary}
              />
            }
          >
            {/* ===== TOP BAR (RESTORED) ===== */}
            <View style={styles.topBar}>
              <Pressable
                style={styles.userSection}
                onPress={() => router.push("/profile")}
              >
                <View style={styles.avatarCircle}>
                  <UserIcon size={20} color={palette.primary} />
                </View>
                <View>
                  <Text style={styles.greeting}>
                    Hello, {currentUser.name.split(" ")[0]}
                  </Text>
                  <Text style={styles.statusLabel}>{displayGoal}</Text>
                </View>
              </Pressable>

              <Pressable
                style={styles.signOutIconButton}
                onPress={() => setShowLogoutModal(true)}
              >
                <LogOut size={22} color={palette.textSecondary} />
              </Pressable>
            </View>

            {/* ===== DAILY PROGRESS (RESTORED) ===== */}
            <DailyProgress
              current={dailyStats}
              goal={{
                calories: currentUser.prefs?.dailyCalorieGoal || "2000",
                type: currentUser.prefs?.fitnessGoal || "maintenance",
              }}
            />

            <Text style={styles.simple}>Implement AI Planner here.</Text>

            {/* ===== HOME VIEW (NOW INCLUDES LOGS) ===== */}
            <HomeView
              currentUser={currentUser}
              dailyStats={dailyStats}
              dailyLogs={dailyLogs} // Populate this from summary.entries
              onRefresh={onRefresh}
              refreshing={refreshing}
              setActiveTab={setActiveTab}
            />
          </ScrollView>
        );
      case "Lens":
        return (
          <View style={styles.placeholder}>
            <AddFood
              onLogSuccess={() => {
                if (currentUser) fetchDailyStats(currentUser.$id);
                setActiveTab("Home");
              }}
            />
          </View>
        );
      case "Track":
      case "Diet":
        return (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>{activeTab} Screen</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1 }}>{renderTabContent()}</View>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Logout Modal (Code omitted for brevity, keep your existing Modal code) */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  scrollContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === "android" ? spacing.xxl : spacing.md,
    paddingBottom: 120,
  },
  placeholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  placeholderText: { color: palette.textSecondary, fontSize: 18 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  simple: { color: "white", marginTop: 20, marginBottom: 10 },
  userSection: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.primaryMedium,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.2)",
  },
  greeting: { color: palette.textPrimary, fontWeight: "900", fontSize: 20 },
  statusLabel: {
    color: palette.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  signOutIconButton: {
    padding: 10,
    backgroundColor: palette.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
  },
});
