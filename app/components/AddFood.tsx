import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
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
import { palette } from "../theme";
import { UserPrefs } from "../types/user";

type AddFoodProps = {
  onLogSuccess?: () => void;
};

export default function AddFood({ onLogSuccess }: AddFoodProps) {
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

  // Restore user session
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

  // NAVIGATION LOGIC: Go back to previous screen
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/"); // Fallback to Home if there is no history
    }
  };

  const handleLogMeal = async (servings: number) => {
    if (!currentUser || !result || "error" in result) return;

    try {
      await logMeal(currentUser.$id, result, servings, imageUri || undefined);
      if (onLogSuccess) {
        onLogSuccess();
      } else {
        Alert.alert("Success", "Meal added to your diary.");
        router.replace("/");
      }
    } catch (error) {
      Alert.alert("Error", "Could not log meal. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* TOP NAVIGATION BAR */}
      <View style={styles.navBar}>
        <Pressable
          style={styles.backButton}
          onPress={handleBack} // Logic attached here
          hitSlop={15}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </Pressable>

        <View style={styles.brandContainer}>
          <MaterialCommunityIcons
            name="molecule"
            size={24}
            color={palette.primary}
          />
          <Text style={styles.brandText}>
            FoodLens <Text style={{ color: "#FFF" }}>AI</Text>
          </Text>
        </View>

        {/* Placeholder to keep brand centered or balanced */}
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.title}>Analyze Meal</Text>
          <Text style={styles.subtitle}>
            Upload or capture your meal to see a complete nutritional breakdown.
          </Text>
        </View>

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
    backgroundColor: "#0F172A",
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    //ddingBottom: 15,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandText: {
    fontSize: 18,
    fontWeight: "900",
    color: palette.primary,
    letterSpacing: -0.5,
  },
  backButton: {
    width: 40,
    height: 40,
    //borderRadius: 12, // Slightly more squared for a modern look
    //backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
    //borderWidth: 1,
    //borderColor: "#334155",
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    //ddingTop: 10,
  },
  headerSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFF",
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    color: "#94A3B8",
    lineHeight: 22,
  },
  mainContent: {
    gap: 24,
    marginBottom: 20,
  },
});
