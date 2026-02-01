import { Stack } from "expo-router";

export default function RootLayout() {
  return (
      <Stack
          screenOptions={{
            title: "FoodLens AI",
            headerStyle: { backgroundColor: "#0B1220" },
            headerTintColor: "#E8EEF9",
            contentStyle: { backgroundColor: "#0B1220" },
          }}
      />
  );
}