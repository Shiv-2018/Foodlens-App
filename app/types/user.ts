import { Models } from "react-native-appwrite";

// Define the specific goal types
export type FitnessGoal = "weight_loss" | "weight_gain" | "endurance" | "muscle_gain" | "maintenance";

// Define the shape of the Appwrite Preferences
export type UserPrefs = {
    dailyCalorieGoal?: string; // Stored as string for easier input handling
    fitnessGoal?: FitnessGoal;
    isOnboarded?: boolean;
};

// Helper type for the User object containing these specific prefs
export type UserWithPrefs = Models.User<UserPrefs>;