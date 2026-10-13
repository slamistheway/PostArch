import { type ReactNode } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import { router } from 'expo-router';
import { GradientBackground } from './gradient-surface';

export async function openPage(path: string) {
  const postMatch = path.match(/^\/postView\/([^/?#]+)/);
  const commentMatch = path.match(/^\/commentView\/([^/?#]+)/);
  const listMatch = path.match(/^\/listView\/([^/?#]+)/);
  if (postMatch) {
    router.push(`/saves/posts/${postMatch[1]}` as never);
    return;
  }
  if (commentMatch) {
    router.push(`/saves/comments/${commentMatch[1]}` as never);
    return;
  }
  if (listMatch) {
    router.push(`/saves/lists/${listMatch[1]}` as never);
    return;
  }
  router.push((path || '/') as never);
}

export function Action({ label, accessibilityLabel, onPress, disabled = false, danger = false, tone = 'green', icon, style }: {
  label: string; onPress: () => void; disabled?: boolean; danger?: boolean;
  accessibilityLabel?: string;
  tone?: 'green' | 'silver' | 'neutral' | 'blue'; icon?: ImageSourcePropType; style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label} disabled={disabled} onPress={onPress}
      style={({ pressed }) => [ui.button, tone === 'silver' && ui.silver, tone === 'neutral' && ui.neutral, tone === 'blue' && ui.blue, danger && ui.danger, style, (pressed || disabled) && ui.dim]}>
      {!danger && (tone === 'green' || tone === 'silver') && <GradientBackground tone={tone} />}
      {icon && <Image source={icon} style={ui.buttonIcon} />}
      <Text style={[ui.buttonText, (tone === 'silver' || tone === 'neutral') && ui.darkButtonText]}>{label}</Text>
    </Pressable>
  );
}

export function Dialog({ title, children, onClose }: {
  title: string; children: ReactNode; onClose: () => void;
}) {
  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <View style={ui.overlay}>
        <Pressable accessibilityLabel="Close dialog" accessibilityRole="button" style={StyleSheet.absoluteFill} onPress={onClose} />
        <View accessibilityViewIsModal style={ui.dialog}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={ui.dialogContent}>
            <Text accessibilityRole="header" style={ui.dialogTitle}>{title}</Text>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export const ui = StyleSheet.create({
  panel: { padding: 16, borderRadius: 32, gap: 8, boxShadow: '0 10px 15px rgba(0,0,0,0.15)' },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  title: { fontSize: 24, fontWeight: '600', color: '#ffffff', textShadowColor: 'rgba(30,60,25,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 },
  text: { color: '#374151', fontSize: 16, lineHeight: 22 },
  input: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, fontSize: 16, color: '#1f2937' },
  button: { backgroundColor: '#84d643', overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, minHeight: 44, boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.3), inset 0 -6px 4px rgba(40,90,35,0.25)' },
  silver: { backgroundColor: '#c6c9c8' },
  buttonText: { color: '#edf7e6', fontSize: 16, fontWeight: '600', textShadowColor: 'rgba(30,60,25,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 },
  darkButtonText: { color: '#374151', textShadowRadius: 0 },
  buttonIcon: { width: 28, height: 28, resizeMode: 'contain' },
  neutral: { backgroundColor: '#d1d5db', borderRadius: 8, boxShadow: 'none' },
  blue: { backgroundColor: '#2563eb', borderRadius: 8, boxShadow: 'none' },
  danger: { backgroundColor: '#ef4444', borderRadius: 8, boxShadow: 'none' },
  dim: { opacity: 0.55 },
  error: { color: '#a12720', fontSize: 15 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', padding: 24 },
  dialog: { backgroundColor: '#ffffff', borderRadius: 12, maxHeight: '85%', width: '100%', maxWidth: 448, alignSelf: 'center', boxShadow: '0 20px 25px rgba(0,0,0,0.2)' },
  dialogTitle: { color: '#111827', fontSize: 20, fontWeight: '700' },
  dialogContent: { padding: 24, gap: 16 },
});
