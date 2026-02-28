import { Image } from "expo-image";
import { Camera, Image as ImageIcon, Sparkles } from "lucide-react-native";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { palette, radii, spacing } from "../theme";

type UploadCardProps = {
  imageUri: string | null;
  canAnalyze: boolean;
  loading: boolean;
  onPickFromGallery: () => void;
  onOpenCamera: () => void;
  onIdentify: () => void;
};

export default function UploadCard({
  imageUri,
  canAnalyze,
  loading,
  onPickFromGallery,
  onOpenCamera,
  onIdentify,
}: UploadCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Identify Food</Text>
        <Text style={styles.subtitle}>Upload or capture a photo to begin</Text>
      </View>

      {imageUri ? (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.preview}
            contentFit="cover"
          />
          <View style={styles.overlayActions}>
            <Pressable style={styles.miniBtn} onPress={onOpenCamera}>
              <Camera size={18} color="#FFF" />
            </Pressable>
            <Pressable style={styles.miniBtn} onPress={onPickFromGallery}>
              <ImageIcon size={18} color="#FFF" />
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Pressable style={styles.uploadBox} onPress={onPickFromGallery}>
            <ImageIcon size={32} color={palette.primary} />
            <Text style={styles.uploadText}>Gallery</Text>
          </Pressable>
          <Pressable
            style={[styles.uploadBox, styles.cameraBox]}
            onPress={onOpenCamera}
          >
            <Camera size={32} color="#FFF" />
            <Text style={[styles.uploadText, { color: "#FFF" }]}>Camera</Text>
          </Pressable>
        </View>
      )}

      <Pressable
        style={[styles.analyzeBtn, !canAnalyze && styles.disabledBtn]}
        onPress={onIdentify}
        disabled={!canAnalyze}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <>
            <Sparkles size={20} color="#FFF" />
            <Text style={styles.analyzeText}>Analyze Image</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: palette.border,
    gap: spacing.lg,
  },
  header: { gap: 4 },
  title: { color: palette.textPrimary, fontSize: 20, fontWeight: "900" },
  subtitle: { color: palette.textSecondary, fontSize: 13 },
  emptyState: { flexDirection: "row", gap: spacing.md, height: 120 },
  uploadBox: {
    flex: 1,
    backgroundColor: palette.primarySoft,
    borderRadius: radii.md,
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: palette.primary,
  },
  cameraBox: {
    backgroundColor: palette.secondary,
    borderColor: "transparent",
    borderStyle: "solid",
  },
  uploadText: {
    marginTop: 8,
    fontWeight: "700",
    color: palette.primary,
    fontSize: 12,
  },
  previewContainer: { borderRadius: radii.md, overflow: "hidden", height: 200 },
  preview: { width: "100%", height: "100%" },
  overlayActions: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    gap: 8,
  },
  miniBtn: { backgroundColor: "rgba(0,0,0,0.5)", padding: 8, borderRadius: 12 },
  analyzeBtn: {
    backgroundColor: palette.primary,
    height: 56,
    borderRadius: radii.md,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  analyzeText: { color: "#FFF", fontWeight: "800", fontSize: 16 },
  disabledBtn: { opacity: 0.5 },
});
