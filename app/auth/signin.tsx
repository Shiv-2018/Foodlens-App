import { useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
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
import { signInWithEmail } from "../services/authService";
import { palette, radii, spacing } from "../theme";

export default function SignInScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email || !password) {
      setMessage("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmail({ email, password });
      router.replace("/");
    } catch (error: any) {
      setMessage(error.message || "Sign in failed");
    } finally {
      setLoading(false);
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
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🥗</Text>
            </View>
            <Text style={styles.title}>Sign In</Text>
            <Text style={styles.subtitle}>
              Analyze your meals with FoodLens AI
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Mail size={20} color={palette.textMuted} />
              <TextInput
                placeholder="Email Address"
                placeholderTextColor={palette.textMuted}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color={palette.textMuted} />
              <TextInput
                placeholder="Password"
                placeholderTextColor={palette.textMuted}
                style={[styles.input, { flex: 1 }]}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color={palette.textMuted} />
                ) : (
                  <Eye size={20} color={palette.textMuted} />
                )}
              </Pressable>
            </View>

            {message && (
              <Text style={{ color: "red", textAlign: "center" }}>
                {message}
              </Text>
            )}

            <Pressable style={styles.primaryButton} onPress={handleSignIn}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Sign In</Text>
              )}
            </Pressable>

            {/* Navigate to Signup */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don’t have an account? </Text>
              <Pressable onPress={() => router.push("/auth/signup")}>
                <Text style={styles.footerLink}>Sign Up</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  },
  subtitle: {
    color: palette.textSecondary,
    textAlign: "center",
    marginTop: 8,
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
  input: {
    flex: 1,
    color: palette.textPrimary,
    marginLeft: 10,
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
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: { color: palette.textMuted },
  footerLink: { color: palette.primary, fontWeight: "800" },
});
