import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { palette } from "../theme";

export type TabType = "Home" | "Track" | "Lens" | "Diet";

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const BottomNav = ({ activeTab, setActiveTab }: BottomNavProps) => {
  const tabs: { name: TabType; icon: any }[] = [
    { name: "Home", icon: "home" },
    { name: "Track", icon: "stats-chart" },
    { name: "Lens", icon: "camera" },
    { name: "Diet", icon: "restaurant" },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => setActiveTab(tab.name)}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? tab.icon : `${tab.icon}-outline`}
              size={24}
              color={isActive ? palette.primary : palette.textMuted}
            />
            <Text
              style={[
                styles.label,
                { color: isActive ? palette.textPrimary : palette.textMuted },
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: palette.surface,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingBottom: Platform.OS === "ios" ? 30 : 30, //Better safe area handling
    paddingTop: 12,
    justifyContent: "space-around",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    width: "100%",
    zIndex: 500,
    elevation: 10,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  label: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "600",
  },
});
