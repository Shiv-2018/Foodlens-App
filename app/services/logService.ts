import { ID, Query } from "react-native-appwrite";
import { parseNutritionValue } from "../utils/nutrition";
import { databases } from "./appwriteClient";

const DB_ID = process.env.EXPO_PUBLIC_APPWRITE_DB_ID!;
const COL_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;
// NEW: Metrics Collection ID
const METRICS_COL_ID = process.env.EXPO_PUBLIC_APPWRITE_METRICS_COLLECTION_ID!;

export type MealLog = {
  $id?: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  imageUri?: string;
};

// --- NEW METRIC TYPES ---
export type MetricType = "water" | "sleep" | "steps" | "workout";

export type MetricLogPayload = {
  userId: string;
  date: string;
  metricType: MetricType;
  value?: number; // Used for water (L), sleep (hrs), steps (count), workout (estimated cals)
  workoutType?: string | null; // e.g., "Running"
  intensity?: string | null; // e.g., "High"
  duration?: number | null; // in minutes
};

const getTodayDate = () => new Date().toISOString().split("T")[0];

// --- EXISTING MEAL LOGIC ---
export async function logMeal(
  userId: string,
  foodResult: any,
  servings: number = 1,
  imageUri?: string,
) {
  if (!userId) throw new Error("User ID required");

  const baseCals = parseNutritionValue(foodResult.nutritionalInfo.calories);
  const baseProtein = parseNutritionValue(foodResult.nutritionalInfo.protein);
  const baseCarbs = parseNutritionValue(foodResult.nutritionalInfo.carbs);
  const baseFat = parseNutritionValue(foodResult.nutritionalInfo.fat);

  const payload = {
    userId,
    date: getTodayDate(),
    name: foodResult.name,
    calories: baseCals * servings,
    protein: baseProtein * servings,
    carbs: baseCarbs * servings,
    fat: baseFat * servings,
    imageUri: imageUri || null,
  };

  return await databases.createDocument(DB_ID, COL_ID, ID.unique(), payload);
}

export async function getDailySummary(userId: string) {
  const today = getTodayDate();

  const response = await databases.listDocuments(DB_ID, COL_ID, [
    Query.equal("userId", userId),
    Query.equal("date", today),
  ]);

  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    logs: response.documents as unknown as MealLog[],
  };

  response.documents.forEach((doc) => {
    totals.calories += doc.calories;
    totals.protein += doc.protein;
    totals.carbs += doc.carbs;
    totals.fat += doc.fat;
  });

  return totals;
}

// --- NEW METRICS LOGIC ---

export async function logDailyMetric(
  userId: string,
  metricType: MetricType,
  data: Partial<MetricLogPayload>,
) {
  if (!userId) throw new Error("User ID required");

  const payload: MetricLogPayload = {
    userId,
    date: getTodayDate(),
    metricType,
    value: data.value || 0,
    workoutType: data.workoutType || null,
    intensity: data.intensity || null,
    duration: data.duration || null,
  };

  return await databases.createDocument(
    DB_ID,
    METRICS_COL_ID,
    ID.unique(),
    payload,
  );
}

export async function getDailyMetricsSummary(userId: string) {
  const today = getTodayDate();

  const response = await databases.listDocuments(DB_ID, METRICS_COL_ID, [
    Query.equal("userId", userId),
    Query.equal("date", today),
  ]);

  // Aggregate metrics
  const summary = {
    water: 0,
    sleep: 0,
    steps: 0,
    workouts: [] as any[],
    totalWorkoutMinutes: 0,
    logs: response.documents,
  };

  response.documents.forEach((doc) => {
    if (doc.metricType === "water") summary.water += doc.value;
    if (doc.metricType === "sleep") summary.sleep += doc.value;
    if (doc.metricType === "steps") summary.steps += doc.value;
    if (doc.metricType === "workout") {
      summary.workouts.push(doc);
      summary.totalWorkoutMinutes += doc.duration || 0;
    }
  });

  return summary;
}

export async function getWeeklyMealLogs(userId: string) {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const response = await databases.listDocuments(DB_ID, COL_ID, [
    Query.equal("userId", userId),
    Query.greaterThanEqual("date", sevenDaysAgo.toISOString().split("T")[0]),
    Query.orderAsc("date"), // Chronological order for charts
  ]);

  return response.documents as unknown as MealLog[];
}

export async function getWeeklyMetrics(userId: string) {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const response = await databases.listDocuments(
    DB_ID,
    METRICS_COL_ID, // Ensure you use your Metrics Collection ID here
    [
      Query.equal("userId", userId),
      // Filtering by the same 7-day date string format
      Query.greaterThanEqual(
        "$createdAt",
        sevenDaysAgo.toISOString().split("T")[0],
      ),
      Query.orderAsc("$createdAt"),
      Query.limit(100), // Added to ensure you don't miss logs in a busy week
    ],
  );

  return response.documents;
}
