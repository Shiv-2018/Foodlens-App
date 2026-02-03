import { FitnessGoal } from "../types/user";

// Helper to extract numbers from strings like "120 kcal" or "20g"
export function parseNutritionValue(value: string | undefined): number {
    if (!value) return 0;
    const match = value.match(/(\d+(\.\d+)?)/);
    return match ? Math.round(parseFloat(match[0])) : 0;
}

// Calculate Macro Targets based on Goal
export function getMacroTargets(calorieGoal: number, goal: FitnessGoal = "maintenance") {
    let ratios = { p: 0.3, c: 0.4, f: 0.3 }; // Default Balanced

    switch (goal) {
        case "muscle_gain":
            ratios = { p: 0.35, c: 0.45, f: 0.2 }; // High carb/protein
            break;
        case "weight_loss":
            ratios = { p: 0.4, c: 0.3, f: 0.3 }; // High protein
            break;
        case "endurance":
            ratios = { p: 0.25, c: 0.55, f: 0.2 }; // High carb
            break;
        case "weight_gain":
            ratios = { p: 0.3, c: 0.4, f: 0.3 }; // Balanced surplus
            break;
    }

    // Calories per gram: Protein=4, Carbs=4, Fat=9
    return {
        calories: calorieGoal,
        protein: Math.round((calorieGoal * ratios.p) / 4),
        carbs: Math.round((calorieGoal * ratios.c) / 4),
        fat: Math.round((calorieGoal * ratios.f) / 9),
    };
}