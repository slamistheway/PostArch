import { Linking, StyleSheet, Text, View } from 'react-native';
import { Action, ui } from './postarch-ui';

export default function LegacyScreen({ title, path }: { title: string; path: string }) {
  const frontendUrl = process.env.EXPO_PUBLIC_FRONTEND_URL;
  const open = () => {
    const fallbackUrl = frontendUrl || process.env.EXPO_PUBLIC_API_URL?.replace(/:3001(?=\/|$)/, ':3000');
    if (fallbackUrl) void Linking.openURL(`${fallbackUrl.replace(/\/$/, '')}${path}`);
  };
  return (
    <View style={styles.container}>
      <Text style={ui.title}>{title}</Text>
      <Text style={ui.text}>This screen is still available in the web frontend.</Text>
      <Action label="Open web page" tone="blue" onPress={open} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 24, gap: 16, justifyContent: 'center', alignItems: 'center' } });
