import { useRouter } from "expo-router";
import { LogOut, User as UserIcon } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
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
import TrackScreen from "./components/Track";
import { restoreSessionUser, signOut } from "./services/authService";
import {
  getDailyMetricsSummary,
  getDailySummary,
  getWeeklyMealLogs,
  MealLog,
} from "./services/logService";
import { palette } from "./theme";
import { UserPrefs } from "./types/user";
import { getGoalLabel } from "./utils/nutrition";

export default function Index() {
  const router = useRouter();

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
  const [dailyLogs, setDailyLogs] = useState<any[]>([]); // This will now hold BOTH meals and metrics

  const [metricsSummary, setMetricsSummary] = useState({
    water: 0,
    sleep: 0,
    steps: 0,
    totalWorkoutMinutes: 0,
  });

  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [weeklyLogs, setWeeklyLogs] = useState<MealLog[]>([]);
  const [isTrackLoading, setIsTrackLoading] = useState(false);

  const fetchTrackData = async () => {
    if (!currentUser) return;
    setIsTrackLoading(true); // Start loading
    try {
      const logs = await getWeeklyMealLogs(currentUser.$id);
      setWeeklyLogs(logs);
    } catch (error) {
      console.error("Failed to fetch weekly trends", error);
    } finally {
      setIsTrackLoading(false); // Stop loading
    }
  };

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

  useEffect(() => {
    if (activeTab === "Track" && currentUser) {
      fetchTrackData();
    }
  }, [activeTab, currentUser]);

  const fetchDailyStats = async (userId: string) => {
    try {
      const [summary, metrics] = await Promise.all([
        getDailySummary(userId) as any,
        getDailyMetricsSummary(userId) as any,
      ]);

      // COMBINE AND SORT ALL LOGS (Meals + Metrics)
      const combinedLogs = [...(summary.logs || []), ...(metrics.logs || [])];

      // Sort newest to oldest
      combinedLogs.sort((a, b) => {
        const dateA = new Date(a.$createdAt).getTime();
        const dateB = new Date(b.$createdAt).getTime();
        return dateB - dateA;
      });

      setDailyLogs(combinedLogs);

      setDailyStats({
        calories: summary.calories || 0,
        protein: summary.protein || 0,
        carbs: summary.carbs || 0,
        fat: summary.fat || 0,
      });

      setMetricsSummary({
        water: metrics.water || 0,
        sleep: metrics.sleep || 0,
        steps: metrics.steps || 0,
        totalWorkoutMinutes: metrics.totalWorkoutMinutes || 0,
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
        fetchTrackData(), // Also refresh weekly data
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

            <DailyProgress
              current={dailyStats}
              goal={{
                calories: currentUser.prefs?.dailyCalorieGoal || "2000",
                type: currentUser.prefs?.fitnessGoal || "maintenance",
              }}
            />

            <HomeView
              currentUser={currentUser}
              dailyStats={dailyStats}
              dailyLogs={dailyLogs}
              metricsSummary={metricsSummary}
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
        return (
          <View style={{ flex: 1, backgroundColor: "#0F172A" }}>
            {isTrackLoading ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ActivityIndicator size="large" color={palette.primary} />
              </View>
            ) : (
              <TrackScreen allLogs={weeklyLogs} />
            )}
          </View>
        );
      default:
        return (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>{activeTab} Screen</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1 }}>{renderTabContent()}</View>
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </SafeAreaView>

      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.logoutIconCircle}>
                <LogOut size={28} color="#EF4444" />
              </View>
              <Text style={styles.modalTitle}>Sign Out</Text>
              <Text style={styles.modalSubtitle}>
                Are you sure you want to log out of your account?
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <Pressable
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.logoutBtn]}
                onPress={confirmSignOut}
              >
                <Text style={styles.logoutBtnText}>Logout</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  safe: { flex: 1 },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 40 : 10,
    paddingBottom: 100,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  placeholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  placeholderText: { color: palette.textSecondary, fontSize: 18 },
  userSection: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.2)",
  },
  greeting: { color: "#FFF", fontWeight: "900", fontSize: 20 },
  statusLabel: {
    color: palette.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  signOutIconButton: {
    padding: 10,
    backgroundColor: "#1E293B",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#1E293B",
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "#334155",
  },
  modalHeader: { alignItems: "center", marginBottom: 32 },
  logoutIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 22,
  },
  modalFooter: { flexDirection: "row", gap: 12 },
  modalBtn: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtn: { backgroundColor: "#334155" },
  cancelBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  logoutBtn: { backgroundColor: "#EF4444" },
  logoutBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
