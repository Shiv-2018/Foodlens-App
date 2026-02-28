import { useRouter } from "expo-router";
import { LogOut, User as UserIcon } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  Modal,
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

import DailyProgress from "./components/DailyProgress";
import Footer from "./components/Footer";

import { restoreSessionUser, signOut } from "./services/authService";
import { getDailySummary } from "./services/logService";
import { palette, spacing } from "./theme";
import { UserPrefs } from "./types/user";
import { getGoalLabel } from "./utils/nutrition";

export default function Index() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<Models.User<UserPrefs> | null>(
    null,
  );

  const [dailyStats, setDailyStats] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

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
      const summary = await getDailySummary(userId);
      setDailyStats(summary);
    } catch (e) {
      console.log("Failed to fetch stats", e);
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
  };

  if (!currentUser) return null;

  const displayGoal = getGoalLabel(
    currentUser.prefs?.fitnessGoal,
  ).toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={palette.primary}
          />
        }
      >
        {/* ===== TOP BAR ===== */}
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
        {/* ===== DAILY PROGRESS ===== */}
        <DailyProgress
          current={dailyStats}
          goal={{
            calories: currentUser.prefs?.dailyCalorieGoal || "2000",
            type: currentUser.prefs?.fitnessGoal || "maintenance",
          }}
        />
        {/* ===== HEADER SECTION ===== */}
        {/* <Header /> */}
        <Text style={styles.simple}>Implement AI Planner here.</Text>
        <Footer />
      </ScrollView>

      {/* ===== LOGOUT MODAL ===== */}
      <Modal
        transparent
        visible={showLogoutModal}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <LogOut size={28} color={palette.primary} />
            </View>

            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to sign out?
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={confirmSignOut}
              >
                <Text style={styles.modalBtnConfirmText}>Logout</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  simple: {
    color: "white",
  },
  safe: {
    flex: 1,
    backgroundColor: palette.background,
    paddingVertical: spacing.xxxl,
  },
  container: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xxl,
    marginBottom: spacing.md,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
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
  greeting: {
    color: palette.textPrimary,
    fontWeight: "900",
    fontSize: 20,
  },
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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  modalContent: {
    width: "90%",
    backgroundColor: palette.surface,
    borderRadius: 24,
    padding: spacing.xxxl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: palette.border,
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: palette.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: palette.border,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: palette.textPrimary,
    marginBottom: spacing.sm,
  },
  modalSubtitle: {
    fontSize: 15,
    color: palette.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xxl,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  modalBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBtnCancel: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  modalBtnConfirm: {
    backgroundColor: palette.primary,
  },
  modalBtnCancelText: {
    color: palette.textSecondary,
    fontWeight: "700",
    fontSize: 16,
  },
  modalBtnConfirmText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 16,
  },
});
