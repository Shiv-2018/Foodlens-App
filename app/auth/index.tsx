import { useRouter } from "expo-router";
import {
    ChevronRight,
    Eye,
    EyeOff,
    Lock,
    Mail,
    User,
} from "lucide-react-native";
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
import {
    signInWithEmail,
    signUpWithEmail
} from "../services/authService";
import { palette, radii, spacing } from "../theme";

type Mode = "signin" | "signup";

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const isSignUp = mode === "signup";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "error" | "success";
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const switchMode = () => {
    setMessage(null);
    setMode(isSignUp ? "signin" : "signup");
  };

  const handleSubmit = async () => {
    if (loading) return;
    setMessage(null);

    if (!email || !password || (isSignUp && !name)) {
      setMessage({ text: "Please fill in all fields", type: "error" });
      return;
    }

    try {
      setLoading(true);
      if (isSignUp) {
        await signUpWithEmail({ name, email, password });
        setMessage({
          text: "Account created! Redirecting...",
          type: "success",
        });
      } else {
        await signInWithEmail({ email, password });
        setMessage({ text: "Welcome back!", type: "success" });
      }
      setTimeout(() => router.replace("/"), 800);
    } catch (error: any) {
      const errorText = error.message?.includes("session is active")
        ? "Already logged in. Redirecting..."
        : error instanceof Error
          ? error.message
          : "Authentication failed";
      setMessage({ text: errorText, type: "error" });
      if (error.message?.includes("session is active")) {
        setTimeout(() => router.replace("/"), 800);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🥗</Text>
            </View>
            <Text style={styles.title}>
              {isSignUp ? "Create Account" : "Sign In"}
            </Text>
            <Text style={styles.subtitle}>
              {isSignUp
                ? "Join FoodLens to track your nutrition"
                : "Analyze your meals with FoodLens AI"}
            </Text>
          </View>

          <View style={styles.form}>
            {isSignUp && (
              <View style={styles.inputContainer}>
                <User
                  size={20}
                  color={palette.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Full Name"
                  placeholderTextColor={palette.textMuted}
                  style={styles.input}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Mail
                size={20}
                color={palette.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email Address"
                placeholderTextColor={palette.textMuted}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock
                size={20}
                color={palette.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor={palette.textMuted}
                style={[styles.input, { flex: 1 }]}
                secureTextEntry={!showPassword}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? (
                  <EyeOff size={20} color={palette.textMuted} />
                ) : (
                  <Eye size={20} color={palette.textMuted} />
                )}
              </Pressable>
            </View>

            {message && (
              <View
                style={[
                  styles.statusBox,
                  message.type === "error"
                    ? styles.errorBox
                    : styles.successBox,
                ]}
              >
                <Text style={styles.statusText}>{message.text}</Text>
              </View>
            )}

            <Pressable
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>
                    {isSignUp ? "Get Started" : "Sign In"}
                  </Text>
                  <ChevronRight size={20} color="#FFF" />
                </>
              )}
            </Pressable>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {isSignUp
                  ? "Already have an account? "
                  : "New to FoodLens AI? "}
              </Text>
              <Pressable onPress={switchMode}>
                <Text style={styles.footerLink}>
                  {isSignUp ? "Log In" : "Sign Up"}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: palette.background },
  scrollContent: {
    paddingHorizontal: spacing.xxxl,
    paddingVertical: 40,
    flexGrow: 1,
    justifyContent: "center",
  },
  header: { alignItems: "center", marginBottom: 40 },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: palette.surfaceAlt,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: palette.border,
  },
  logoEmoji: { fontSize: 40 },
  title: {
    fontSize: 32,
    color: palette.textPrimary,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: palette.textSecondary,
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
    opacity: 0.8,
  },
  form: { gap: 16 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: spacing.xl,
    height: 60,
  },
  inputIcon: { marginRight: spacing.md },
  input: { flex: 1, color: palette.textPrimary, fontSize: 16, height: "100%" },
  eyeBtn: { padding: 8 },
  statusBox: { padding: 12, borderRadius: radii.md, alignItems: "center" },
  errorBox: { backgroundColor: "rgba(239, 68, 68, 0.1)" },
  successBox: { backgroundColor: "rgba(34, 197, 94, 0.1)" },
  statusText: { fontSize: 14, fontWeight: "600", color: palette.textPrimary },
  primaryButton: {
    backgroundColor: palette.primary,
    borderRadius: radii.lg,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    gap: 8,
  },
  primaryButtonText: { color: "#FFF", fontWeight: "800", fontSize: 18 },
  disabledButton: { opacity: 0.6 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  footerText: { color: palette.textMuted, fontSize: 15 },
  footerLink: { color: palette.primary, fontWeight: "800", fontSize: 15 },
});
