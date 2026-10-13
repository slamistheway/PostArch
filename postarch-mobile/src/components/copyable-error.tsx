import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export default function CopyableError({ message }: { message: string }) {
  const [copiedMessage, setCopiedMessage] = useState('');
  const [copyFailed, setCopyFailed] = useState(false);

  const copy = async () => {
    try {
      await Clipboard.setStringAsync(message);
      setCopiedMessage(message);
      setCopyFailed(false);
    } catch {
      setCopyFailed(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text accessibilityRole="alert" style={styles.label}>Error</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Copy error text" onPress={() => void copy()} style={styles.copyButton}>
          <Text style={styles.copyButtonText}>{copiedMessage === message && !copyFailed ? 'Copied' : 'Copy'}</Text>
        </Pressable>
      </View>
      <TextInput accessibilityLabel="Copyable error text" editable={false} multiline value={message} style={styles.input} />
      {copyFailed && <Text style={styles.copyFailed}>Could not copy the error text.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 5, width: '100%' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: '#991b1b', fontWeight: '700', fontSize: 13 },
  copyButton: { backgroundColor: '#991b1b', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 7, minHeight: 36, justifyContent: 'center' },
  copyButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
  input: { color: '#7f1d1d', backgroundColor: '#fff4f2', borderColor: '#fca5a5', borderWidth: 1, borderRadius: 8, padding: 10, minHeight: 48, fontSize: 14 },
  copyFailed: { color: '#991b1b', fontSize: 12 },
});
