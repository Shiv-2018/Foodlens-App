# 🥗 Foodlens AI

> **Nutrition tracking, reimagined with Generative AI.**

**Foodlens AI** is a next-generation nutrition tracking application that solves the **“logging friction crisis”**. Instead of relying on static food databases that fail with home-cooked meals, Foodlens AI utilizes **Google Gemini 2.5 Flash** to visually analyze meals, reason about portion sizes, and generate accurate nutritional data dynamically — even for complex or mixed dishes.

---

## 📌 Project Status (Current)

* ✅ **Core AI Image Analysis** (Vision MVP)
* ✅ **Authentication System** (Appwrite Auth)
* ✅ **Database Integration** (Log Service)
* ✅ **Smart Goal Profiling** (Dynamic Macro Targets)
* 🚧 **AI Meal Suggestions** (In Progress)

---

## 🚀 The Problem vs. Our Solution

### ❌ The Problem: The "Database Constraint"
Traditional apps rely on **Classification + Static Database Lookup**.
* **The Issue:** If you upload a picture of *Butter Chicken*, the system retrieves a generic average value. It cannot distinguish between a healthy home-cooked version and a rich restaurant version.
* **The Result:** A **30% accuracy gap**, leading to user frustration and drop-off.

### ✅ The Solution: Generative Visual Reasoning
Foodlens AI uses a **Vision Engine powered by LLMs** (Gemini 2.5 Flash).
* **Method:** The AI analyzes the specific image for portion size, visible oil, consistency, and context.
* **Outcome:** Accurate macro estimation for unique, home-cooked, or mixed dishes that don't exist in any database.

---

## ✨ Key Features

### 📸 Camera-to-Macro Pipeline
Instantly transforms meal photos into structured JSON nutritional data (calories, protein, carbs, fat) using Gemini 2.5 technology.

### 🧠 AI Planner & Smart Goals
Sets dynamic daily calorie & macro targets based on your specific fitness goal (e.g., **Weight Loss**, **Muscle Gain**, **Endurance**) and automatically recalibrates based on intake patterns.

### 🔔 7 PM Macro Audit (Proactive Logic)
At 7 PM, the system audits your daily intake to detect deficits or excesses and provides smart nudges.
> *Example: "You're 25g short on protein. Consider Greek yogurt or paneer."*

---

## 🛠️ Tech Stack

### 📱 Frontend & Mobile
* **Framework:** React Native (Expo)
* **Language:** TypeScript (Strict Mode)
* **UI Components:** Lucide React Native, Custom Dark Mode

### 🗄 Backend & Infrastructure
* **BaaS:** Appwrite
* **Authentication:** Appwrite Auth (Email/Password Sessions)
* **Database:** Appwrite Databases (Meal logs & User preferences)
* **Storage:** Expo Secure Store (Session persistence)

### 🤖 Artificial Intelligence
* **Model:** Google Gemini 2.5 Flash
* **Integration:** `GoogleGenerativeAI` SDK for visual recognition and JSON extraction.

---

## 📦 Installation & Setup

### Prerequisites
* Node.js (v18+)
* Expo Go app installed on your device

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/foodlens-ai.git](https://github.com/your-username/foodlens-ai.git)
cd foodlens-ai
```

### 2. Install Dependencies
```bash
npm install
```
#### or
```bash
yarn install
```

### 3. Environment ConfigurationCreate a .env file in the root directory with the following keys:
```bash
#Appwrite Configuration
EXPO_PUBLIC_APPWRITE_ENDPOINT=[https://cloud.appwrite.io/v1](https://cloud.appwrite.io/v1)
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
EXPO_PUBLIC_APPWRITE_PLATFORM=com.foodlens.app
EXPO_PUBLIC_APPWRITE_DB_ID=your_database_id
EXPO_PUBLIC_APPWRITE_COLLECTION_ID=your_collection_id

# Google Gemini AI
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run the Application
```bash
npx expo start
```

#### Scan the QR code with Expo Go to launch.

---

## 👥 Team

| Member | Role | Focus Areas |
| :--- | :--- | :--- |
| **Ratnesh Kumar Jaiswal** | Backend & Infrastructure | Data integrity, Database optimization, Daily macro aggregation |
| **Shivendra Singh** | Frontend Experience | High-performance UI/UX, Latency reduction, User engagement |
| **Ritik Kumar** | AI Accuracy | Prompt tuning, Vision optimization (>98% accuracy) |


---

Apache License Version 2.0 © 2026 Foodlens AI

Foodlens AI — Smart. Accurate. Effortless.

