import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateDynamicDietPlan(apiKey: string, userStats: any) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  //   const prompt = `
  //   User Profile: ${JSON.stringify(userStats)}

  //   1. Calculate the daily Calorie, Protein, Carb, and Fat requirements based on the user's profile above.
  //   2. Create a 7-day plan with exactly 4 meals: Breakfast, Lunch, Snacks, Dinner.
  //   3. Return ONLY a JSON object with this structure:
  //   {
  //     "analysis": {
  //       "calories": "Calculated Number",
  //       "protein": "Calculated grams (e.g. 160g)",
  //       "carbs": "Calculated grams",
  //       "fats": "Calculated grams",
  //       "reasoning": "A 2-sentence explanation of why this plan fits their goal"
  //     },
  //     "days": {
  //        "Mon": [
  //          { "type": "Breakfast", "meal": "...", "kcal": 500, "imageKeyword": "..." },
  //          { "type": "Lunch", "meal": "...", "kcal": 700, "imageKeyword": "..." },
  //          { "type": "Snacks", "meal": "...", "kcal": 200, "imageKeyword": "..." },
  //          { "type": "Dinner", "meal": "...", "kcal": 600, "imageKeyword": "..." }
  //        ],
  //       ... (repeat for all days)
  //     }
  //   }
  // `;

  const prompt = `
    Act as a professional Nutritionist for a user: ${userStats.gender}, ${userStats.age}y, ${userStats.weight}kg, ${userStats.goal}.

    CRITICAL INSTRUCTION: 
    Calculate the daily Calorie, Protein, Carb, and Fat requirements SPECIFICALLY for this user's stats and goal. 
    Then, create a 7-day diet plan. For EVERY day, you MUST provide EXACTLY 4 meals: "Breakfast", "Lunch", "Snacks", and "Dinner".

    For EVERY meal, you MUST provide:
    1. "meal": Descriptive name.
    2. "kcal": Number (calculated for this user).
    3. "imageKeyword": 2-word food search term (e.g., "grilled salmon").
    4. "icon": ONLY use these: "egg", "fish", "food-apple", "bread-slice", "leaf", "turkey".

    JSON Structure (Replace values with your calculations):
    {
      "analysis": {
        "calories": 2000, 
        "protein": "150g",
        "carbs": "200g",
        "fats": "60g",
        "reasoning": "A 2-sentence explanation of why this specific calorie and macro breakdown fits this user's goal."
      },
      "days": {
        "Mon": [
          { "type": "Breakfast", "meal": "...", "kcal": 500, "imageKeyword": "...", "icon": "..." },
          { "type": "Lunch", "meal": "...", "kcal": 700, "imageKeyword": "...", "icon": "..." },
          { "type": "Snacks", "meal": "...", "kcal": 200, "imageKeyword": "...", "icon": "..." },
          { "type": "Dinner", "meal": "...", "kcal": 600, "imageKeyword": "...", "icon": "..." }
        ],
        "Tue": [...],
        "Wed": [...],
        "Thu": [...],
        "Fri": [...],
        "Sat": [...],
        "Sun": [...]
      }
    }

    Return ONLY the JSON.
  `;

  // const prompt = `
  //   Act as a professional Nutritionist for a user: ${userStats.gender}, ${userStats.age}y, ${userStats.weight}kg, ${userStats.goal}.

  //   Create a 7-day diet plan. For EVERY meal, you MUST provide:
  //   1. "meal": Descriptive name.
  //   2. "kcal": Number.
  //   3. "imageKeyword": 2-word food search term (e.g., "grilled salmon").
  //   4. "icon": ONLY use these: "egg", "fish", "food-apple", "bread-slice", "leaf", "turkey".

  //  JSON Structure:
  // {
  //   "analysis": {
  //     "calories": 2000,
  //     "protein": "150g",
  //     "carbs": "200g",
  //     "fats": "60g",
  //     "reasoning": "..."
  //   },
  //   "days": {
  //     "Mon": [
  //       { "type": "Breakfast", "meal": "...", "kcal": 500, "imageKeyword": "..." },
  //       { "type": "Lunch", "meal": "...", "kcal": 700, "imageKeyword": "..." },
  //       { "type": "Snacks", "meal": "...", "kcal": 200, "imageKeyword": "..." },
  //       { "type": "Dinner", "meal": "...", "kcal": 600, "imageKeyword": "..." }
  //     ],
  //     ... (repeat for all days)
  //   }
  // }
  // `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (error) {
    return null;
  }
}
