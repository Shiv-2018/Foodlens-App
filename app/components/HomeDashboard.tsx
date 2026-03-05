import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { palette, spacing } from "../theme";

const { width } = Dimensions.get("window");

interface HomeViewProps {
  currentUser: any;
  dailyStats: any;
  dailyLogs: any[];
  onRefresh: () => Promise<void>;
  refreshing: boolean;
  setActiveTab: (tab: any) => void;
}

export const HomeView = ({
  currentUser,
  dailyStats,
  dailyLogs,
  setActiveTab,
}: HomeViewProps) => {
  // Global Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [activeMetric, setActiveMetric] = useState<string | null>(null);

  // Form States
  const [waterAmount, setWaterAmount] = useState(2);
  const [sleepHours, setSleepHours] = useState(8);
  const [stepsCount, setStepsCount] = useState(5000);
  const [workoutType, setWorkoutType] = useState("Running");
  const [intensity, setIntensity] = useState("Medium");
  const [workoutDuration, setWorkoutDuration] = useState(30);

  // Custom Picker Visibility States
  const [showActivityPicker, setShowActivityPicker] = useState(false);
  const [showIntensityPicker, setShowIntensityPicker] = useState(false);

  const targets = { protein: 175, carbs: 225, fat: 44 };

  const metrics = [
    { id: "workout", label: "Workout", icon: "run", target: "Goal: 440 cal" },
    {
      id: "steps",
      label: "Steps",
      icon: "shoe-print",
      target: "Goal: 10,000 steps",
    },
    {
      id: "sleep",
      label: "Sleep",
      icon: "weather-night",
      target: "Goal: 8 hours",
    },
    { id: "water", label: "Water", icon: "water", target: "Goal: 10 glasses" },
  ];

  const openSetter = (id: string) => {
    setActiveMetric(id);
    setModalVisible(true);
  };

  // --- INTERNAL COMPONENTS ---

  const CustomPickerTrigger = ({ label, value, icon, onPress }: any) => (
    <Pressable style={styles.enhancedPickerTrigger} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={20} color={palette.primary} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.pickerLabel}>{label}</Text>
        <Text style={styles.pickerValueText}>{value}</Text>
      </View>
      <Ionicons name="chevron-down" size={20} color="#64748B" />
    </Pressable>
  );

  const PickerModal = ({ visible, title, options, onSelect, onClose }: any) => (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.enhancedPickerContent}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerHeaderTitle}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close-circle" size={28} color="#ef4444" />
            </Pressable>
          </View>
          <ScrollView>
            {options.map((opt: string) => (
              <Pressable
                key={opt}
                style={styles.optionItem}
                onPress={() => {
                  onSelect(opt);
                  onClose();
                }}
              >
                <Text style={styles.optionText}>{opt}</Text>
                <Ionicons name="chevron-forward" size={16} color="#334155" />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderSetterContent = () => {
    switch (activeMetric) {
      case "water":
        return (
          <View style={styles.setterInner}>
            <Text style={styles.setterTitle}>Water Intake</Text>
            <Text style={styles.setterValue}>{waterAmount.toFixed(1)} L</Text>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={0}
              maximumValue={5}
              step={0.1}
              value={waterAmount}
              onValueChange={setWaterAmount}
              minimumTrackTintColor={palette.primary}
              maximumTrackTintColor="#334155"
            />
          </View>
        );
      case "sleep":
        return (
          <View style={styles.setterInner}>
            <Text style={styles.setterTitle}>Sleep Duration</Text>
            <Text style={styles.setterValue}>
              {Math.round(sleepHours)} Hours
            </Text>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={0}
              maximumValue={15}
              step={1}
              value={sleepHours}
              onValueChange={setSleepHours}
              minimumTrackTintColor={palette.primary}
              maximumTrackTintColor="#334155"
            />
          </View>
        );
      case "steps":
        return (
          <View style={styles.setterInner}>
            <Text style={styles.setterTitle}>Daily Steps</Text>
            <Text style={styles.setterValue}>
              {stepsCount.toLocaleString()} steps
            </Text>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={0}
              maximumValue={20000}
              step={500}
              value={stepsCount}
              onValueChange={setStepsCount}
              minimumTrackTintColor={palette.primary}
              maximumTrackTintColor="#334155"
            />
          </View>
        );
      case "workout":
        return (
          <View style={styles.setterInner}>
            <Text style={styles.setterTitle}>Log Activity</Text>

            <CustomPickerTrigger
              label="Activity / Game"
              value={workoutType}
              icon="basketball-hoop-outline"
              onPress={() => setShowActivityPicker(true)}
            />

            <CustomPickerTrigger
              label="Intensity Level"
              value={intensity}
              icon="speedometer"
              onPress={() => setShowIntensityPicker(true)}
            />

            <Text style={[styles.setterTitle, { marginTop: 24, fontSize: 16 }]}>
              Duration
            </Text>
            <Text style={styles.setterValue}>{workoutDuration} min</Text>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={5}
              maximumValue={120}
              step={5}
              value={workoutDuration}
              onValueChange={setWorkoutDuration}
              minimumTrackTintColor={palette.primary}
              maximumTrackTintColor="#334155"
            />

            <PickerModal
              visible={showActivityPicker}
              title="Select Activity"
              options={[
                "Running",
                "Football",
                "Cricket",
                "Gym",
                "Yoga",
                "Swimming",
              ]}
              onSelect={setWorkoutType}
              onClose={() => setShowActivityPicker(false)}
            />

            <PickerModal
              visible={showIntensityPicker}
              title="Choose Intensity"
              options={["Low", "Medium", "High"]}
              onSelect={setIntensity}
              onClose={() => setShowIntensityPicker(false)}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* QUICK METRICS GRID */}
      <View style={styles.metricsGrid}>
        {metrics.map((item) => (
          <View key={item.id} style={styles.metricRow}>
            <View style={styles.metricIconBox}>
              <MaterialCommunityIcons
                name={item.icon as any}
                size={24}
                color={palette.textPrimary}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.metricLabel}>{item.label}</Text>
              <Text style={styles.metricSub}>{item.target}</Text>
            </View>
            <Pressable
              onPress={() => openSetter(item.id)}
              style={styles.addSmallBtn}
            >
              <Ionicons name="add" size={20} color="#FFF" />
            </Pressable>
          </View>
        ))}
      </View>

      {/* MAIN FOOD TRACKER CARD */}
      <View style={styles.mainCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headerIconContainer}>
            <MaterialCommunityIcons
              name="silverware-fork-knife"
              size={20}
              color={palette.primary}
            />
          </View>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={styles.cardTitle}>Track Food</Text>
            <Text style={styles.cardSubtitle}>Goal: 2000 kcal</Text>
          </View>
          <Pressable onPress={() => setActiveTab("Lens")} hitSlop={15}>
            <Ionicons
              name="camera-outline"
              size={26}
              color={palette.textPrimary}
            />
          </Pressable>
        </View>

        <View style={styles.macroRow}>
          <MacroCircle
            label="Protein"
            current={dailyStats.protein}
            target={targets.protein}
            color="#10B981"
          />
          <MacroCircle
            label="Carbs"
            current={dailyStats.carbs}
            target={targets.carbs}
            color="#3B82F6"
          />
          <MacroCircle
            label="Fat"
            current={dailyStats.fat}
            target={targets.fat}
            color="#F59E0B"
          />
        </View>
      </View>

      {/* LOG MODAL */}
      {/* LOG MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* HEADER WITH CLOSE BUTTON */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <Pressable
                onPress={() => setModalVisible(false)}
                style={styles.closeModalBtn}
                hitSlop={15}
              >
                <Ionicons name="close-circle" size={32} color="#475569" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {renderSetterContent()}

              <Pressable
                style={styles.doneBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.doneBtnText}>Save Log</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Text style={styles.sectionTitle}>Today's Logs</Text>

      {dailyLogs.map((log, index) => {
        const logDate = new Date(log.$createdAt);
        const timeStr = logDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        const timeParts = timeStr.split(" ");
        const timeDisplay = timeParts[0] || "--:--";
        const amPmDisplay = (timeParts[1] || "").toLowerCase();

        return (
          <View key={log.$id || index} style={styles.timelineItem}>
            {/* LEFT TIME COLUMN */}
            <View style={styles.timeColumn}>
              <Text style={styles.timeText}>{timeDisplay}</Text>
              {amPmDisplay ? (
                <Text style={styles.amPmText}>{amPmDisplay}</Text>
              ) : null}
              {index !== dailyLogs.length - 1 && (
                <View style={styles.verticalLine} />
              )}
            </View>

            {/* RIGHT CONTENT CARD */}
            <View style={styles.logCard}>
              <View style={styles.logHeaderRow}>
                <View style={styles.foodIconCircle}>
                  <MaterialCommunityIcons
                    name="food-apple"
                    size={18}
                    color="#FF9F43"
                  />
                </View>
                <Text style={styles.logFoodName} numberOfLines={3}>
                  {log.name}
                </Text>
              </View>

              <View style={styles.caloriesRow}>
                <Text style={styles.logCalAmount}>
                  {Math.round(log.calories)}
                </Text>
                <Text style={styles.logCalLabel}>/275 Cal Eaten</Text>
              </View>

              <View style={styles.logDivider} />

              <View style={styles.innerMacroRow}>
                <LogMacroCircle
                  label="Protein"
                  value={log.protein}
                  target={30}
                  color="#10B981"
                />
                <LogMacroCircle
                  label="Fat"
                  value={log.fat}
                  target={15}
                  color="#F59E0B"
                />
                <LogMacroCircle
                  label="Carbs"
                  value={log.carbs}
                  target={40}
                  color="#3B82F6"
                />
                <LogMacroCircle
                  label="Fiber"
                  value={2}
                  target={10}
                  color="#A78BFA"
                />
              </View>

              <Pressable style={styles.insightBtn}>
                <Ionicons name="sparkles-outline" size={14} color="#00D261" />
                <Text style={styles.insightBtnText}>View Insight</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const MacroCircle = ({ label, current, target, color }: any) => {
  const percentage = Math.min(Math.round((current / target) * 100), 100) || 0;
  return (
    <View style={styles.circleWrapper}>
      <View
        style={[styles.circleBase, { borderColor: "rgba(255,255,255,0.05)" }]}
      >
        <View
          style={[
            styles.circleProgress,
            {
              borderColor: color,
              transform: [{ rotate: `${percentage * 3.6 - 45}deg` }],
            },
          ]}
        />
        <Text style={styles.circlePercentage}>{percentage}%</Text>
      </View>
      <Text style={styles.circleLabel}>{label}</Text>
    </View>
  );
};
const LogMacroCircle = ({ label, value, target, color }: any) => {
  const percentage = Math.min(value / target, 1);
  return (
    <View style={styles.innerCircleWrapper}>
      <View style={styles.innerCircleBase}>
        <View
          style={[
            styles.innerCircleProgress,
            {
              borderColor: color,
              transform: [{ rotate: `${percentage * 360 - 45}deg` }],
            },
          ]}
        />
        <MaterialCommunityIcons
          name="leaf"
          size={10}
          color={palette.textMuted}
        />
      </View>
      <Text style={styles.innerLabel}>{label}</Text>
      <Text style={styles.innerValue}>{value}g</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // --- LAYOUT ---
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  contentContainer: {
    //paddingHorizontal: 20, // Perfectly aligned with Index.tsx
    paddingTop: 0, // Removed to avoid double-spacing with top bar
    paddingBottom: 40,
  },

  // --- QUICK METRICS GRID ---
  metricsGrid: {
    marginBottom: 24,
    gap: 12,
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  metricIconBox: {
    width: 44,
    height: 44,
    backgroundColor: "#334155",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  metricLabel: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  metricSub: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 2,
  },
  addSmallBtn: {
    width: 32,
    height: 32,
    backgroundColor: "#334155",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#475569",
  },

  // --- MAIN FOOD TRACKER CARD ---
  mainCard: {
    backgroundColor: "#1E293B",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerIconContainer: {
    padding: 8,
    backgroundColor: "#334155",
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFF",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 2,
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  // --- MACRO CIRCLES (Dashboard) ---
  circleWrapper: {
    alignItems: "center",
  },
  circleBase: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  circleProgress: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
  },
  circlePercentage: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFF",
  },
  circleLabel: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 8,
    fontWeight: "600",
  },

  // --- TIMELINE & LOGS ---
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFF",
    marginTop: 32,
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 24,
  },
  timeColumn: {
    width: 65,
    alignItems: "center",
    paddingTop: 8,
  },
  timeText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFF",
  },
  amPmText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 2,
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#334155",
    marginVertical: 12,
    borderRadius: 1,
  },
  logCard: {
    flex: 1,
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  logHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start", // Changed from 'center' to 'flex-start' so the icon stays at the top if the text wraps
    marginBottom: 14,
  },
  foodIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logFoodName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFF",
    flex: 1,
    flexWrap: "wrap", // Ensures the text breaks into a new line
    lineHeight: 22,
  },
  caloriesRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 14,
  },
  logCalAmount: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFF",
  },
  logCalLabel: {
    fontSize: 14,
    color: "#94A3B8",
    marginLeft: 6,
    fontWeight: "500",
  },
  logDivider: {
    height: 1,
    backgroundColor: "#334155",
    marginVertical: 16,
  },

  // --- MACRO CIRCLES (Inside Log Card) ---
  innerMacroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  innerCircleWrapper: {
    alignItems: "center",
  },
  innerCircleBase: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2.5,
    borderColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircleProgress: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2.5,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
  },
  innerLabel: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 6,
    fontWeight: "600",
  },
  innerValue: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFF",
    marginTop: 1,
  },

  // --- INSIGHT BUTTON ---
  insightBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 210, 97, 0.1)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  insightBtnText: {
    color: "#00D261",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 8,
  },

  // --- MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#1E293B",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    position: "absolute",
    bottom: 0,
    width: "100%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
    position: "relative",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#334155",
    borderRadius: 2,
    marginTop: 8,
  },
  closeModalBtn: {
    position: "absolute",
    right: 0,
    top: -5,
  },
  setterInner: {
    alignItems: "center",
    marginBottom: 24,
  },
  setterTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 16,
  },
  setterValue: {
    color: palette.primary,
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 20,
  },
  doneBtn: {
    backgroundColor: palette.primary,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  doneBtnText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 16,
  },

  // --- ENHANCED PICKERS (Inside Modal) ---
  enhancedPickerTrigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    padding: 16,
    borderRadius: 16,
    width: "100%",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  pickerLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  pickerValueText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 2,
  },
  enhancedPickerContent: {
    backgroundColor: "#1E293B",
    margin: 20,
    borderRadius: 24,
    padding: 20,
    maxHeight: "70%",
    borderWidth: 1,
    borderColor: "#334155",
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  pickerHeaderTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "900",
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(51, 65, 85, 0.5)",
  },
  optionText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
