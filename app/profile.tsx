import { useRouter } from "expo-router";
import { ArrowLeft, Sparkles, Target } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getCurrentUser } from "../app/services/authService";
import { palette, radii, spacing } from "../app/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await getCurrentUser();
      setUserName(user.name);
    } catch (e) {
      console.error("Failed to load user", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ActivityIndicator
          size="large"
          color={palette.primary}
          style={{ marginTop: 50 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={palette.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.label}>Account</Text>

          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>{userName}</Text>
          </View>
        </View>

        {/* Manage Goals */}
        <View style={styles.section}>
          <Text style={styles.label}>Health & Targets</Text>

          <Pressable
            style={styles.manageCard}
            onPress={() => router.push("/components/ManageGoals")}
          >
            <View style={styles.manageLeft}>
              <Target size={22} color={palette.primary} />
              <View>
                <Text style={styles.manageTitle}>Manage Goals</Text>
                <Text style={styles.manageDesc}>
                  Set daily calorie target & fitness goal
                </Text>
              </View>
            </View>

            <ArrowLeft
              size={18}
              color={palette.textMuted}
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </Pressable>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Food Tracking</Text>

          <Pressable
            style={styles.manageCard}
            onPress={() => router.push("/components/AddFood")}
          >
            <View style={styles.manageLeft}>
              <Sparkles size={22} color={palette.primary} />
              <View>
                <Text style={styles.manageTitle}>Add Daily Food</Text>
                <Text style={styles.manageDesc}>
                  Capture or upload food to analyze
                </Text>
              </View>
            </View>

            <ArrowLeft
              size={18}
              color={palette.textMuted}
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.xl,
  },

  backBtn: { padding: 8, marginLeft: -8 },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: palette.textPrimary,
  },

  content: { padding: spacing.xl, gap: spacing.xxl },

  section: { gap: spacing.sm },

  label: {
    color: palette.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  readOnlyField: {
    padding: spacing.lg,
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
  },

  readOnlyText: {
    color: palette.textMuted,
    fontSize: 16,
  },

  manageCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
  },

  manageLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  manageTitle: {
    color: palette.textPrimary,
    fontWeight: "800",
    fontSize: 16,
  },

  manageDesc: {
    color: palette.textMuted,
    fontSize: 13,
  },
});
