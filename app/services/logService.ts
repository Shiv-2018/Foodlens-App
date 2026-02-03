import { ID, Query } from "react-native-appwrite";
import { appwriteClient, databases } from "./appwriteClient"; // We need to export databases from client
import { parseNutritionValue } from "../utils/nutrition";

const DB_ID = process.env.EXPO_PUBLIC_APPWRITE_DB_ID!;
const COL_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;

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

// Helper to get today's date string YYYY-MM-DD
const getTodayDate = () => new Date().toISOString().split('T')[0];

export async function logMeal(userId: string, foodResult: any, servings: number = 1, imageUri?: string) {
    if (!userId) throw new Error("User ID required");

    // Parse base values
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
        imageUri: imageUri || null
    };

    return await databases.createDocument(DB_ID, COL_ID, ID.unique(), payload);
}

export async function getDailySummary(userId: string) {
    const today = getTodayDate();

    // Fetch logs for this user for today
    const response = await databases.listDocuments(DB_ID, COL_ID, [
        Query.equal("userId", userId),
        Query.equal("date", today)
    ]);

    // Aggregate totals
    const totals = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        logs: response.documents as unknown as MealLog[]
    };

    response.documents.forEach((doc) => {
        totals.calories += doc.calories;
        totals.protein += doc.protein;
        totals.carbs += doc.carbs;
        totals.fat += doc.fat;
    });

    return totals;
}