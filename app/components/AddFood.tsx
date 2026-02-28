import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import type { Models } from "react-native-appwrite";

import CameraModal from "../components/CameraModal";
import FoodInfoCard from "../components/FoodInfoCard";
import UploadCard from "../components/UploadCard";

import { useFoodLens } from "../hooks/useFoodLens";
import { restoreSessionUser } from "../services/authService";
import { logMeal } from "../services/logService";
import { palette, spacing } from "../theme";
import { UserPrefs } from "../types/user";

export default function AddFood() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<Models.User<UserPrefs> | null>(
    null,
  );

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

  // Restore logged-in user
  useEffect(() => {
    (async () => {
      try {
        const user = await restoreSessionUser();
        if (user) setCurrentUser(user);
      } catch (error) {
        console.log("Failed to restore session", error);
      }
    })();
  }, []);

  const handleLogMeal = async (servings: number) => {
    if (!currentUser || !result || "error" in result) return;

    try {
      await logMeal(currentUser.$id, result, servings, imageUri || undefined);

      Alert.alert("Success", "Meal added to your diary.");

      // Navigate back to home so Daily Target refreshes
      router.replace("/");
    } catch (error) {
      Alert.alert("Error", "Could not log meal. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== FOODLENS AI HEADER ===== */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>FoodLens AI</Text>
          <Text style={styles.subtitle}>
            Upload a meal image to analyze its nutritional breakdown.
          </Text>
        </View>

        {/* ===== MAIN CONTENT ===== */}
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
      </ScrollView>

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
  container: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: spacing.xxxl,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: palette.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: palette.textSecondary,
    lineHeight: 22,
  },
  mainContent: {
    gap: spacing.xxl,
    marginBottom: spacing.xxxl,
  },
});
