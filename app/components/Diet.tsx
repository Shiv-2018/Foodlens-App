import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { generateDynamicDietPlan } from "../services/dietPlanner";
import { palette } from "../theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// 1. SUB-COMPONENT FOR MACROS (Fixes the missing protein/carbs/fats)
const MacroPill = ({ label, val, color }: any) => (
  <View style={styles.pill}>
    <Text style={styles.pillLabel}>{label}</Text>
    <Text style={[styles.pillVal, { color }]}>{val || "0g"}</Text>
  </View>
);

export default function DietPlanner({ apiKey, userStats }: any) {
  const daysArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentDayName = daysArray[new Date().getDay()];

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(
    currentDayName === "Sun" ? "Sun" : currentDayName,
  );
  const [recipe, setRecipe] = useState<string | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);

  const fetchPlan = async () => {
    setLoading(true);
    const data = await generateDynamicDietPlan(apiKey, userStats);
    setPlan(data);
    setLoading(false);
  };

  const fetchRecipe = async (mealName: string) => {
    setLoadingRecipe(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(
        `Provide a detailed recipe for ${mealName}. Use sections 'Ingredients' and 'Instructions'. Use bullet points for ingredients.`,
      );
      setRecipe(result.response.text());
    } catch (e) {
      setRecipe("Could not load recipe.");
    }
    setLoadingRecipe(false);
  };

  useEffect(() => {
    fetchPlan();
  }, [userStats]);

  // 2. RECIPE FORMATTER (Adds Bold Titles & Bullet Points)
  const renderFormattedRecipe = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, index) => {
      const trimmed = line.trim().replace(/[#*]/g, "");
      if (
        trimmed.toLowerCase().includes("ingredients") ||
        trimmed.toLowerCase().includes("instructions") ||
        trimmed.toLowerCase().includes("steps")
      ) {
        return (
          <Text key={index} style={styles.recipeSectionHeader}>
            {trimmed.includes("Ingredients")
              ? "🛒 Ingredients"
              : "👨‍🍳 Instructions"}
          </Text>
        );
      }
      if (
        line.trim().startsWith("-") ||
        line.trim().startsWith("*") ||
        /^\d+\./.test(line.trim())
      ) {
        return (
          <View key={index} style={styles.recipeBulletRow}>
            <View style={styles.recipeBullet} />
            <Text style={styles.recipeBulletText}>{trimmed}</Text>
          </View>
        );
      }
      return trimmed.length > 0 ? (
        <Text key={index} style={styles.recipeBodyText}>
          {trimmed}
        </Text>
      ) : null;
    });
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );

  if (!plan || !plan.days)
    return (
      <View style={styles.center}>
        <Text style={{ color: "#94A3B8", marginBottom: 15 }}>
          Could not generate plan.
        </Text>
        <TouchableOpacity onPress={fetchPlan} style={styles.retryBtn}>
          <Text style={{ color: "#FFF", fontWeight: "bold" }}>
            Retry Generation
          </Text>
        </TouchableOpacity>
      </View>
    );

  const currentDayMeals = plan.days[selectedDay] || [];

  return (
    <View style={{ flex: 1, backgroundColor: "#0F172A" }}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>
          AI <Text style={{ color: palette.primary }}>Coach</Text>
        </Text>
        <TouchableOpacity onPress={fetchPlan} style={styles.refreshIcon}>
          <Ionicons name="refresh" size={22} color={palette.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* SUMMARY CARD */}
        <View style={styles.summaryContainer}>
          <ImageBackground
            source={{
              uri: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600&auto=format&fit=crop",
            }}
            style={styles.summaryCard}
            imageStyle={{ borderRadius: 28, opacity: 0.35 }}
          >
            <View style={styles.summaryContent}>
              <View style={styles.kcalBadge}>
                <Text style={styles.kcalBadgeText}>
                  {plan.analysis?.calories || 2000} kcal/day
                </Text>
              </View>
              <Text style={styles.targetReason}>
                {plan.analysis?.reasoning}
              </Text>

              {/* THE MACRO GRID */}
              <View style={styles.macroGrid}>
                <MacroPill
                  label="Prot"
                  val={plan.analysis?.protein}
                  color="#60A5FA"
                />
                <MacroPill
                  label="Carb"
                  val={plan.analysis?.carbs}
                  color="#34D399"
                />
                <MacroPill
                  label="Fats"
                  val={plan.analysis?.fats}
                  color="#FBBF24"
                />
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* DAY STRIP */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dayStrip}
          contentContainerStyle={{ paddingLeft: 20 }}
        >
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <TouchableOpacity
              key={day}
              onPress={() => setSelectedDay(day)}
              style={[styles.dayTab, selectedDay === day && styles.activeTab]}
            >
              <Text
                style={[
                  styles.dayText,
                  selectedDay === day && styles.activeDayText,
                ]}
              >
                {day}
              </Text>
              {day === currentDayName && <View style={styles.todayIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* MEALS */}
        <View style={{ paddingHorizontal: 20 }}>
          {currentDayMeals.map((item: any, i: number) => (
            <View key={i} style={styles.mealCard}>
              <ImageBackground
                source={{
                  uri: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=60&w=500&food=${item.meal}`,
                }}
                style={styles.mealImage}
              >
                <View style={styles.imageOverlay}>
                  <Text style={styles.mealTypeBadge}>{item.type}</Text>
                </View>
              </ImageBackground>
              <View style={styles.mealInfo}>
                <View style={styles.mealTitleRow}>
                  <Text style={styles.mealName}>{item.meal}</Text>
                  <Text style={styles.kcalText}>{item.kcal} kcal</Text>
                </View>
                <TouchableOpacity
                  style={styles.recipeBtn}
                  onPress={() => fetchRecipe(item.meal)}
                >
                  <MaterialCommunityIcons
                    name="chef-hat"
                    size={20}
                    color={palette.primary}
                  />
                  <Text style={styles.recipeBtnText}>View Full Recipe</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* RECIPE MODAL */}
      <Modal
        visible={!!recipe || loadingRecipe}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setRecipe(null)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            {loadingRecipe ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={palette.primary} />
                <Text style={styles.modalLoadingText}>Writing Recipe...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.modalTitle}>Recipe Guide</Text>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={styles.modalScroll}
                >
                  {renderFormattedRecipe(recipe || "")}
                  <View style={{ height: 100 }} />
                </ScrollView>
                <TouchableOpacity
                  onPress={() => setRecipe(null)}
                  style={styles.closeBtn}
                >
                  <Text style={styles.closeBtnText}>Done</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F172A",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 15,
  },
  header: { fontSize: 28, fontWeight: "900", color: "#FFF" },
  refreshIcon: { padding: 10, backgroundColor: "#1E293B", borderRadius: 14 },
  summaryContainer: { paddingHorizontal: 20, marginBottom: 25 },
  summaryCard: {
    backgroundColor: "#1E293B",
    borderRadius: 28,
    overflow: "hidden",
  },
  summaryContent: { padding: 22 },
  kcalBadge: {
    backgroundColor: palette.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  kcalBadgeText: { color: "#FFF", fontWeight: "900" },
  targetReason: {
    color: "#CBD5E1",
    fontSize: 14,
    marginTop: 12,
    lineHeight: 20,
  },
  macroGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    padding: 15,
    borderRadius: 20,
  },
  pill: { alignItems: "center", flex: 1 },
  pillLabel: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  pillVal: { fontSize: 15, fontWeight: "800", marginTop: 2 },
  dayStrip: { marginBottom: 20 },
  dayTab: {
    width: 58,
    height: 65,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E293B",
    marginRight: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#334155",
  },
  activeTab: { backgroundColor: palette.primary, borderColor: palette.primary },
  dayText: { color: "#94A3B8", fontWeight: "bold" },
  activeDayText: { color: "#FFF" },
  todayIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFF",
    marginTop: 4,
  },
  mealCard: {
    backgroundColor: "#1E293B",
    borderRadius: 26,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#334155",
  },
  mealImage: { height: 160, width: "100%" },
  imageOverlay: { flex: 1, padding: 15, justifyContent: "flex-end" },
  mealTypeBadge: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignSelf: "flex-start",
    padding: 5,
    borderRadius: 6,
  },
  mealInfo: { padding: 18 },
  mealTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  mealName: { color: "#FFF", fontSize: 18, fontWeight: "700", flex: 1 },
  kcalText: { color: palette.primary, fontWeight: "900" },
  recipeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${palette.primary}20`,
    paddingVertical: 12,
    borderRadius: 16,
  },
  recipeBtnText: { color: palette.primary, fontWeight: "800", marginLeft: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#0F172A",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 25,
    height: SCREEN_HEIGHT * 0.75,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#334155",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 15,
  },
  modalTitle: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 20,
  },
  modalLoading: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalLoadingText: { color: "#94A3B8", marginTop: 10 },
  modalScroll: { flex: 1 },
  recipeSectionHeader: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 25,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: palette.primary,
    paddingLeft: 12,
  },
  recipeBulletRow: { flexDirection: "row", marginBottom: 10, paddingLeft: 5 },
  recipeBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.primary,
    marginRight: 12,
    marginTop: 8,
  },
  recipeBulletText: { color: "#E2E8F0", fontSize: 16, lineHeight: 24, flex: 1 },
  recipeBodyText: {
    color: "#94A3B8",
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 10,
  },
  closeBtn: {
    position: "absolute",
    bottom: 30,
    left: 25,
    right: 25,
    backgroundColor: palette.primary,
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
  },
  closeBtnText: { color: "#FFF", fontWeight: "900" },
  retryBtn: { backgroundColor: palette.primary, padding: 12, borderRadius: 10 },
});
