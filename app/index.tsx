import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import { GoogleGenerativeAI } from "@google/generative-ai";

type FoodResult = {
    name: string;
    cuisine: string;
    ingredients: string;
    nutritionalInfo: Record<string, string>;
    details: Record<string, string>;
};

type ResultState = FoodResult | { error: string } | null;

function safeFallbackFromText(text: string): FoodResult {
    return {
        name: "Food Item",
        cuisine: "Unable to determine cuisine",
        ingredients: text,
        nutritionalInfo: {
            calories: "N/A",
            protein: "N/A",
            carbs: "N/A",
            fat: "N/A",
            fiber: "N/A",
        },
        details: {
            prepTime: "N/A",
            servingSize: "N/A",
            difficulty: "N/A",
            taste: "N/A",
        },
    };
}

function extractJSONFromText(text: string): FoodResult {
    // Gemini sometimes returns extra text; we recover the first JSON object-like block.
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return safeFallbackFromText(text);

    try {
        return JSON.parse(jsonMatch[0]) as FoodResult;
    } catch {
        return safeFallbackFromText(text);
    }
}

export default function Index() {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);

    const [result, setResult] = useState<ResultState>(null);
    const [loading, setLoading] = useState(false);

    const [cameraOpen, setCameraOpen] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();

    const canAnalyze = useMemo(() => Boolean(imageBase64 && !loading), [imageBase64, loading]);

    const pickFromGallery = async () => {
        setResult(null);

        const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!mediaPermission.granted) {
            Alert.alert("Permission needed", "Please allow photo library access to upload an image.");
            return;
        }

        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            base64: true,
            quality: 0.9,
        });

        if (res.canceled) return;

        const asset = res.assets?.[0];
        if (!asset?.uri || !asset.base64) return;

        setImageUri(asset.uri);
        setImageBase64(asset.base64);
    };

    const openCamera = async () => {
        setResult(null);

        if (!permission?.granted) {
            const next = await requestPermission();
            if (!next.granted) {
                Alert.alert("Permission needed", "Please allow camera access to take a photo.");
                return;
            }
        }

        setCameraOpen(true);
    };

    const identifyFood = async () => {
        if (!imageBase64) return;

        if (!apiKey) {
            setResult({ error: "Missing API key. Set EXPO_PUBLIC_GEMINI_API_KEY in Foodlens-App/.env and restart Expo." });
            return;
        }

        setLoading(true);
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `
Analyze this food image and provide detailed information in the following JSON format (no markdown or code blocks):
{
  "name": "Dish Name",
  "cuisine": "Cuisine Origin",
  "ingredients": "Main ingredients list",
  "nutritionalInfo": {
    "calories": "per serving",
    "protein": "in grams",
    "carbs": "in grams",
    "fat": "in grams",
    "fiber": "in grams"
  },
  "details": {
    "prepTime": "estimated preparation time",
    "servingSize": "typical serving size",
    "difficulty": "cooking difficulty level",
    "taste": "flavor profile description"
  }
}
      `.trim();

            const geminiRes = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: imageBase64,
                        mimeType: "image/jpeg",
                    },
                },
            ]);

            const text = geminiRes.response.text();
            const parsed = extractJSONFromText(text);
            setResult(parsed);
        } catch (e) {
            setResult({ error: "Failed to identify food item. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.container}>
                <Header />

                <View style={styles.grid}>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Upload Food Image</Text>

                        <View style={styles.buttonRow}>
                            <Pressable style={styles.button} onPress={pickFromGallery}>
                                <Text style={styles.buttonText}>Upload from Gallery</Text>
                            </Pressable>

                            <Pressable style={[styles.button, styles.secondaryButton]} onPress={openCamera}>
                                <Text style={styles.buttonText}>Open Camera</Text>
                            </Pressable>
                        </View>

                        {imageUri ? (
                            <View style={styles.previewWrap}>
                                <Image source={{ uri: imageUri }} style={styles.preview} contentFit="cover" />
                                <Pressable
                                    style={[styles.button, !canAnalyze && styles.buttonDisabled]}
                                    onPress={identifyFood}
                                    disabled={!canAnalyze}
                                >
                                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Identify Food</Text>}
                                </Pressable>
                            </View>
                        ) : (
                            <Text style={styles.muted}>Pick or capture an image to preview it here.</Text>
                        )}
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Food Information</Text>

                        {result ? (
                            "error" in result ? (
                                <View style={styles.errorBox}>
                                    <Text style={styles.errorTitle}>Error</Text>
                                    <Text style={styles.errorText}>{result.error}</Text>
                                </View>
                            ) : (
                                <ResultView result={result} />
                            )
                        ) : (
                            <Text style={styles.muted}>Upload an image to see food information.</Text>
                        )}
                    </View>
                </View>

                <HowToUse />
                <Footer />

                <Modal visible={cameraOpen} animationType="slide" onRequestClose={() => setCameraOpen(false)}>
                    <CameraScreen
                        onClose={() => setCameraOpen(false)}
                        onCaptured={(uri, base64) => {
                            setImageUri(uri);
                            setImageBase64(base64);
                            setCameraOpen(false);
                            setResult(null);
                        }}
                    />
                </Modal>
            </ScrollView>
        </SafeAreaView>
    );
}

function Header() {
    return (
        <View style={styles.header}>
            <Text style={styles.h1}>FoodLens AI</Text>
            <Text style={styles.lead}>
                Snap or upload a food photo to get ingredients, nutrition, and extra details powered by AI.
            </Text>
        </View>
    );
}

function HowToUse() {
    const steps = [
        { title: "Snap a Photo", desc: "Capture a clear image (good lighting helps a lot)." },
        { title: "AI Analysis", desc: "The model identifies the dish and extracts nutrition data." },
        { title: "Get Insights", desc: "See ingredients, cuisine, and additional cooking details." },
    ];

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>How to Use FoodLens AI</Text>
            <View style={styles.stepGrid}>
                {steps.map((s) => (
                    <View key={s.title} style={styles.stepCard}>
                        <Text style={styles.stepTitle}>{s.title}</Text>
                        <Text style={styles.stepDesc}>{s.desc}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

function Footer() {
    return (
        <View style={styles.footer}>
            <Text style={styles.footerTitle}>FoodLens AI</Text>
            <Text style={styles.footerText}>© 2026 FoodLens AI. All rights reserved.</Text>
        </View>
    );
}

function ResultView({ result }: { result: FoodResult }) {
    return (
        <View style={{ gap: 14 }}>
            <View>
                <Text style={styles.resultName}>{result.name}</Text>
                <Text style={styles.resultLine}>Cuisine: {result.cuisine}</Text>
            </View>

            <View>
                <Text style={styles.subTitle}>Ingredients</Text>
                <Text style={styles.resultLine}>{result.ingredients}</Text>
            </View>

            <View>
                <Text style={styles.subTitle}>Nutritional Information</Text>
                <KeyValueTable data={result.nutritionalInfo} />
            </View>

            <View>
                <Text style={styles.subTitle}>Additional Details</Text>
                <KeyValueTable data={result.details} humanizeKeys />
            </View>
        </View>
    );
}

function KeyValueTable({
                           data,
                           humanizeKeys,
                       }: {
    data: Record<string, string>;
    humanizeKeys?: boolean;
}) {
    const entries = Object.entries(data ?? {});
    if (entries.length === 0) return <Text style={styles.muted}>No data.</Text>;

    return (
        <View style={styles.table}>
            {entries.map(([k, v]) => {
                const label = humanizeKeys ? k.replace(/([A-Z])/g, " $1").trim() : k;
                return (
                    <View key={k} style={styles.tableRow}>
                        <Text style={styles.tableKey}>{label}</Text>
                        <Text style={styles.tableValue}>{v}</Text>
                    </View>
                );
            })}
        </View>
    );
}

function CameraScreen({
                          onClose,
                          onCaptured,
                      }: {
    onClose: () => void;
    onCaptured: (uri: string, base64: string) => void;
}) {
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraRef, setCameraRef] = useState<CameraView | null>(null);

    const takePhoto = async () => {
        try {
            if (!cameraRef || !cameraReady) return;
            const photo = await cameraRef.takePictureAsync({ base64: true, quality: 0.9 });

            if (!photo?.uri || !photo.base64) {
                Alert.alert("Capture failed", "Could not read image data. Please try again.");
                return;
            }

            onCaptured(photo.uri, photo.base64);
        } catch {
            Alert.alert("Capture failed", "Please try again.");
        }
    };

    return (
        <SafeAreaView style={styles.cameraSafe}>
            <View style={styles.cameraTopBar}>
                <Pressable style={[styles.button, styles.secondaryButton]} onPress={onClose}>
                    <Text style={styles.buttonText}>Close</Text>
                </Pressable>
            </View>

            <View style={styles.cameraWrap}>
                <CameraView
                    ref={(ref) => setCameraRef(ref)}
                    style={styles.camera}
                    facing="back"
                    onCameraReady={() => setCameraReady(true)}
                />
            </View>

            <View style={styles.cameraBottomBar}>
                <Pressable style={styles.button} onPress={takePhoto} disabled={!cameraReady}>
                    <Text style={styles.buttonText}>{cameraReady ? "Take Photo" : "Starting Camera..."}</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#0B1220" },
    container: { padding: 16, gap: 16 },

    header: { paddingVertical: 10, gap: 10 },
    h1: { fontSize: 34, fontWeight: "800", color: "#E8EEF9" },
    lead: { fontSize: 14.5, lineHeight: 20, color: "#B7C4DD" },

    grid: { gap: 12 },
    card: {
        backgroundColor: "#111B2E",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        gap: 12,
    },
    cardTitle: { color: "#E8EEF9", fontSize: 18, fontWeight: "700" },

    buttonRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
    button: {
        backgroundColor: "#2563EB",
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
    },
    secondaryButton: { backgroundColor: "#334155" },
    buttonDisabled: { opacity: 0.5 },
    buttonText: { color: "#FFFFFF", fontWeight: "700" },

    previewWrap: { gap: 10 },
    preview: { width: "100%", height: 220, borderRadius: 14, backgroundColor: "#0B1220" },

    muted: { color: "#93A4C7", fontSize: 13.5, lineHeight: 18 },

    errorBox: { backgroundColor: "rgba(239,68,68,0.12)", padding: 12, borderRadius: 12 },
    errorTitle: { color: "#FCA5A5", fontWeight: "800", marginBottom: 4 },
    errorText: { color: "#FECACA" },

    resultName: { color: "#E8EEF9", fontSize: 20, fontWeight: "800" },
    resultLine: { color: "#B7C4DD", lineHeight: 19 },

    subTitle: { color: "#D7E2F7", fontWeight: "800", marginBottom: 6 },

    table: {
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },
    tableRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: "rgba(255,255,255,0.03)",
    },
    tableKey: { color: "#9DB0D3", textTransform: "capitalize", flex: 1, paddingRight: 10 },
    tableValue: { color: "#E8EEF9", fontWeight: "700" },

    section: { gap: 10, marginTop: 8 },
    sectionTitle: { color: "#E8EEF9", fontSize: 18, fontWeight: "800" },
    stepGrid: { gap: 10 },
    stepCard: {
        backgroundColor: "#0F1A2D",
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },
    stepTitle: { color: "#E8EEF9", fontWeight: "800", marginBottom: 4 },
    stepDesc: { color: "#B7C4DD", lineHeight: 18 },

    footer: {
        marginTop: 10,
        paddingVertical: 18,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.08)",
        gap: 6,
    },
    footerTitle: { color: "#E8EEF9", fontWeight: "900" },
    footerText: { color: "#93A4C7" },

    cameraSafe: { flex: 1, backgroundColor: "#000" },
    cameraTopBar: { padding: 12 },
    cameraWrap: { flex: 1, paddingHorizontal: 12, paddingBottom: 12 },
    camera: { flex: 1, borderRadius: 16, overflow: "hidden" },
    cameraBottomBar: { padding: 12 },
});