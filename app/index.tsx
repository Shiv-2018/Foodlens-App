import { useRouter } from "expo-router";
import { LogOut, User as UserIcon } from "lucide-react-native"; // Added AlertCircle for the icon
import { useCallback, useEffect, useState } from "react";
import {
    Alert,
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

// Components ... (rest of imports remain same)
import CameraModal from "./components/CameraModal";
import DailyProgress from "./components/DailyProgress";
import FoodInfoCard from "./components/FoodInfoCard";
import Footer from "./components/Footer";
import Header from "./components/Header";
import UploadCard from "./components/UploadCard";

// Logic ...
import { useFoodLens } from "./hooks/useFoodLens";
import { restoreSessionUser, signOut } from "./services/authService";
import { getDailySummary, logMeal } from "./services/logService";
import { palette, spacing } from "./theme"; // 2. Ensure radii is imported
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

  // 3. Added State for the Logout Modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  const handleLogMeal = async (servings: number) => {
    if (!currentUser || !result || "error" in result) return;
    try {
      await logMeal(currentUser.$id, result, servings, imageUri || undefined);
      await fetchDailyStats(currentUser.$id);
      Alert.alert("Success", "Meal logged to your daily summary.");
    } catch (error: any) {
      Alert.alert("Error", "Could not log meal. Please try again.");
    }
  };

  // 4. Updated Sign Out Logic to handle the confirmation
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

          {/* Trigger Modal instead of direct logout */}
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

          <FoodInfoCard result={result} onLogMeal={handleLogMeal} />
        </View>

        <Footer />
      </ScrollView>

      {/* 5. ADDED THEMED LOGOUT POP-UP */}
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

      <CameraModal
        visible={cameraOpen}
        onRequestClose={closeCamera}
        onCaptured={handleImageCaptured}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.background,
    paddingVertical: spacing.xxxl,
  },
  container: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xxl,
    marginBottom: spacing.md,
  },
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
  mainContent: { gap: spacing.xxl, marginBottom: spacing.xxxl },

  // 6. Added Modal Styles
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
    borderRadius: 24, // Matches radii.xl if you had it, or use 24
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
    borderRadius: 16, // Matches radii.lg
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
