import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

const apiUrl = process.env.EXPO_PUBLIC_API_URL || '(missing)';
const frontendUrl = process.env.EXPO_PUBLIC_FRONTEND_URL || '(missing)';
const derivedUrl = process.env.EXPO_PUBLIC_FRONTEND_URL
  || process.env.EXPO_PUBLIC_API_URL?.replace(/:3001(?=\/|$)/, ':3000')
  || '(none)';

export default function EnvironmentDebug() {
  const [visible, setVisible] = useState(!process.env.EXPO_PUBLIC_FRONTEND_URL);
  return (
    <>
      <Pressable accessibilityRole="button" onPress={() => setVisible(true)} style={styles.badge}>
        <Text style={styles.badgeText}>ENV</Text>
      </Pressable>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.title}>Expo environment diagnostics</Text>
            <Text style={styles.label}>EXPO_PUBLIC_API_URL</Text>
            <Text selectable style={styles.value}>{apiUrl}</Text>
            <Text style={styles.label}>EXPO_PUBLIC_FRONTEND_URL</Text>
            <Text selectable style={styles.value}>{frontendUrl}</Text>
            <Text style={styles.label}>URL the app will use</Text>
            <Text selectable style={styles.value}>{derivedUrl}</Text>
            <Text style={styles.help}>
              Expo embeds environment variables when Metro starts. After changing `.env`, stop Expo and run `npx expo start -c` from postarch-mobile.
            </Text>
            <Pressable accessibilityRole="button" onPress={() => setVisible(false)} style={styles.close}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  badge: { position: 'absolute', top: 8, right: 8, zIndex: 1000, backgroundColor: '#b42318', borderRadius: 14, paddingHorizontal: 9, paddingVertical: 5 },
  badgeText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,.7)', justifyContent: 'center', padding: 24 },
  dialog: { width: '100%', maxWidth: 480, alignSelf: 'center', backgroundColor: '#ffffff', borderRadius: 16, padding: 20, gap: 8 },
  title: { color: '#111827', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  label: { color: '#6b7280', fontSize: 12, fontWeight: '700', marginTop: 5 },
  value: { color: '#111827', fontSize: 15, padding: 8, backgroundColor: '#f3f4f6', borderRadius: 6 },
  help: { color: '#374151', lineHeight: 20, marginTop: 8 },
  close: { alignSelf: 'flex-end', backgroundColor: '#2563eb', borderRadius: 8, paddingHorizontal: 18, paddingVertical: 10, marginTop: 8 },
  closeText: { color: '#ffffff', fontWeight: '700' },
});
