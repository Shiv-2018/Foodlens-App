import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { signUpWithEmail } from "../services/authService";
import { palette, radii, spacing } from "../theme";

type FormType = {
  name: string;
  email: string;
  password: string;
  gender: string;
  goalType: string;
  activityLevel: string;
  age: string;
  height: string;
  weight: string;
  targetWeight: string;
  speed: string;
  medical: string;
};

//////////////////////////////////////////////////////////////////
// ✅ MOVED OUTSIDE (Fix keyboard issue)
//////////////////////////////////////////////////////////////////

const InputField = ({
                      placeholder,
                      value,
                      onChange,
                      keyboardType = "default",
                      secure = false,
                    }: any) => (
    <View style={styles.inputContainer}>
      <TextInput
          placeholder={placeholder}
          placeholderTextColor={palette.textMuted}
          style={styles.input}
          keyboardType={keyboardType}
          secureTextEntry={secure}
          value={value}
          onChangeText={onChange}
      />
    </View>
);

const OptionButton = ({
                        label,
                        selected,
                        onPress,
                      }: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => (
    <Pressable
        onPress={onPress}
        style={[styles.optionButton, selected && styles.optionSelected]}
    >
      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
        {label}
      </Text>
    </Pressable>
);

//////////////////////////////////////////////////////////////////

export default function SignUpScreen() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState<FormType>({
    name: "",
    email: "",
    password: "",
    gender: "",
    goalType: "",
    activityLevel: "",
    age: "",
    height: "",
    weight: "",
    targetWeight: "",
    speed: "",
    medical: "",
  });

  const setField = (field: keyof FormType, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const requiredFields: Record<number, (keyof FormType)[]> = {
    1: ["name", "email", "password"],
    2: ["gender"],
    3: ["goalType"],
    4: ["activityLevel"],
    5: ["age"],
    6: ["height"],
    7: ["weight"],
    8: ["targetWeight"],
    9: ["speed"],
    10: ["medical"],
  };

  const validateStep = () =>
      requiredFields[step].every((key) => form[key] !== "");

  const nextStep = () => {
    if (!validateStep()) {
      setMessage("Incomplete step - All fields are required");
      return;
    }

    setMessage(null);

    if (step < 10) setStep(step + 1);
    else handleSignUp();
  };

  const handleSignUp = async () => {
    if (!form.name || !form.email || !form.password) {
      setMessage("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      // Calculate BMI to save it directly to the database
      const bmiVal = form.height && form.weight
          ? (Number(form.weight) / (Number(form.height) / 100) ** 2).toFixed(1)
          : undefined;

      // Pass the entire form state + BMI to the auth service
      await signUpWithEmail({
        ...form,
        bmi: bmiVal
      });

      router.replace("/");
    } catch (error: any) {
      setMessage(error.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  /////////////////////////////////////////////////////////////////
  // Healthy Weight Range Calculation (BMI 18.5 - 24.9)
  /////////////////////////////////////////////////////////////////

  let healthyWeightRange: string | null = null;

  if (form.height) {
    const heightInMeters = Number(form.height) / 100;
    if (heightInMeters > 0) {
      const minWeight = (18.5 * (heightInMeters ** 2)).toFixed(1);
      const maxWeight = (24.9 * (heightInMeters ** 2)).toFixed(1);
      healthyWeightRange = `${minWeight} - ${maxWeight} kg`;
    }
  }

  /////////////////////////////////////////////////////////////////

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
            <>
              <Text style={styles.question}>Basic Details</Text>
              <InputField
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(t: string) => setField("name", t)}
              />
              <InputField
                  placeholder="Email Address"
                  keyboardType="email-address"
                  value={form.email}
                  onChange={(t: string) => setField("email", t)}
              />
              <InputField
                  placeholder="Password"
                  secure
                  value={form.password}
                  onChange={(t: string) => setField("password", t)}
              />
            </>
        );

      case 2:
        return (
            <>
              <Text style={styles.question}>Select Gender</Text>
              <OptionButton
                  label="Male"
                  selected={form.gender === "Male"}
                  onPress={() => setField("gender", "Male")}
              />
              <OptionButton
                  label="Female"
                  selected={form.gender === "Female"}
                  onPress={() => setField("gender", "Female")}
              />
              <OptionButton
                  label="Other"
                  selected={form.gender === "Other"}
                  onPress={() => setField("gender", "Other")}
              />
            </>
        );

      case 3:
        return (
            <>
              <Text style={styles.question}>Your Goal</Text>
              <OptionButton
                  label="Lose Weight"
                  selected={form.goalType === "Lose Weight"}
                  onPress={() => setField("goalType", "Lose Weight")}
              />
              <OptionButton
                  label="Gain Muscle"
                  selected={form.goalType === "Gain Muscle"}
                  onPress={() => setField("goalType", "Gain Muscle")}
              />
              <OptionButton
                  label="Stay Fit"
                  selected={form.goalType === "Stay Fit"}
                  onPress={() => setField("goalType", "Stay Fit")}
              />
            </>
        );

      case 4:
        return (
            <>
              <Text style={styles.question}>Activity Level</Text>
              <OptionButton
                  label="Low"
                  selected={form.activityLevel === "Low"}
                  onPress={() => setField("activityLevel", "Low")}
              />
              <OptionButton
                  label="Moderate"
                  selected={form.activityLevel === "Moderate"}
                  onPress={() => setField("activityLevel", "Moderate")}
              />
              <OptionButton
                  label="High"
                  selected={form.activityLevel === "High"}
                  onPress={() => setField("activityLevel", "High")}
              />
            </>
        );

      case 5:
        return (
            <>
              <Text style={styles.question}>Your Age</Text>
              <InputField
                  placeholder="Age"
                  keyboardType="numeric"
                  value={form.age}
                  onChange={(t: string) => setField("age", t)}
              />
            </>
        );

      case 6:
        return (
            <>
              <Text style={styles.question}>Your Height (cm)</Text>
              <InputField
                  placeholder="Height"
                  keyboardType="numeric"
                  value={form.height}
                  onChange={(t: string) => setField("height", t)}
              />
            </>
        );

      case 7:
        return (
            <>
              <Text style={styles.question}>Current Weight (kg)</Text>
              <InputField
                  placeholder="Weight"
                  keyboardType="numeric"
                  value={form.weight}
                  onChange={(t: string) => setField("weight", t)}
              />
            </>
        );

      case 8:
        return (
            <>
              <Text style={styles.question}>Target Weight (kg)</Text>
              <InputField
                  placeholder="Target Weight"
                  keyboardType="numeric"
                  value={form.targetWeight}
                  onChange={(t: string) => setField("targetWeight", t)}
              />

              {healthyWeightRange && (
                  <View style={styles.bmiBox}>
                    <Text style={styles.bmiText}>Ideal Weight: {healthyWeightRange}</Text>
                  </View>
              )}
            </>
        );

      case 9:
        return (
            <>
              <Text style={styles.question}>
                How fast do you want to reach goal?
              </Text>
              <OptionButton
                  label="1 Month"
                  selected={form.speed === "1 Month"}
                  onPress={() => setField("speed", "1 Month")}
              />
              <OptionButton
                  label="3 Months"
                  selected={form.speed === "3 Months"}
                  onPress={() => setField("speed", "3 Months")}
              />
              <OptionButton
                  label="6 Months"
                  selected={form.speed === "6 Months"}
                  onPress={() => setField("speed", "6 Months")}
              />
            </>
        );

      case 10:
        return (
            <>
              <Text style={styles.question}>Any Medical Conditions?</Text>
              <InputField
                  placeholder="Type here..."
                  value={form.medical}
                  onChange={(t: string) => setField("medical", t)}
              />
            </>
        );
    }
  };

  return (
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Sign Up</Text>
              <Text style={styles.headerTitle}>
                Join FoodLens to track your nutrition
              </Text>
              <Text style={styles.subtitle}>Step {step} of 10</Text>
            </View>

            <View style={styles.form}>
              {renderStep()}

              {message && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{message}</Text>
                  </View>
              )}

              <Pressable style={styles.primaryButton} onPress={nextStep}>
                {loading ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <Text style={styles.primaryButtonText}>
                      {step === 10 ? "Create Account" : "Next"}
                    </Text>
                )}
              </Pressable>

              {step > 1 && (
                  <Pressable onPress={() => setStep(step - 1)}>
                    <Text style={styles.backText}>Go Back</Text>
                  </Pressable>
              )}
              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>Already have an account? </Text>

                <Pressable onPress={() => router.replace("/auth/signin")}>
                  <Text style={styles.footerLink}>Sign In</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
}

//////////////////////////////////////////////////////////////
// STYLES
//////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },

  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },

  footerText: {
    fontSize: 14,
    color: palette.textMuted,
  },

  footerLink: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.primary,
  },

  scrollContent: {
    paddingHorizontal: spacing.xxxl,
    paddingVertical: 40,
    flexGrow: 1,
    justifyContent: "center",
  },

  header: { alignItems: "center", marginBottom: 40 },

  headerTitle: {
    color: palette.textSecondary,
    textAlign: "center",
    marginBottom: 30,
  },

  title: {
    fontSize: 32,
    color: palette.textPrimary,
    fontWeight: "900",
  },

  subtitle: {
    color: palette.textSecondary,
    marginTop: 8,
  },

  form: { gap: 16 },

  question: {
    textAlign: "center",
    alignSelf: "center",
    fontSize: 20,
    fontWeight: "800",
    color: palette.textPrimary,
    marginBottom: spacing.lg,
  },

  inputContainer: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: spacing.xl,
    height: 60,
    justifyContent: "center",
  },

  input: {
    color: palette.textPrimary,
  },

  optionButton: {
    height: 60,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    justifyContent: "center",
    alignItems: "center",
  },

  optionSelected: {
    borderColor: palette.primary,
    borderWidth: 2,
    backgroundColor: palette.surfaceAlt,
  },

  optionText: {
    color: palette.textPrimary,
    fontWeight: "700",
  },

  optionTextSelected: {
    color: palette.primary,
  },

  primaryButton: {
    backgroundColor: palette.primary,
    borderRadius: radii.lg,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 18,
  },

  backText: {
    textAlign: "center",
    color: palette.textMuted,
    marginTop: 10,
  },

  errorBox: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderWidth: 1,
    padding: spacing.lg,
    borderRadius: radii.lg,
  },

  errorText: {
    color: "red",
    textAlign: "center",
  },

  bmiBox: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: palette.border,
  },

  bmiText: {
    color: palette.textPrimary,
    textAlign: "center",
    fontWeight: "800",
  },
});