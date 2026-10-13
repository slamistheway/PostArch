import { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

export default function PinWarningToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timeout);
  }, [message, onDismiss]);

  if (!message) return null;
  return <Pressable accessibilityRole="alert" accessibilityLabel={message} onPress={onDismiss} style={styles.toast}>
    <Text style={styles.text}>{message}</Text>
  </Pressable>;
}

const styles = StyleSheet.create({
  toast: { position: 'absolute', top: 64, left: 16, right: 16, zIndex: 100, borderRadius: 14,
    backgroundColor: '#fff3cd', borderWidth: 1, borderColor: '#e0a800', padding: 14,
    boxShadow: '0 8px 24px rgba(0,0,0,0.25)' },
  text: { color: '#5f4700', fontSize: 15, fontWeight: '700', textAlign: 'center' },
});
