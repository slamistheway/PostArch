import { useState } from 'react';
import { usePathname } from 'expo-router';
import { Pressable, ScrollView, Text } from 'react-native';
import { openPage, ui } from './postarch-ui';
import { errorText } from '@/shared/functions';
import CopyableError from './copyable-error';
import GradientSurface, { GradientBackground } from './gradient-surface';

export default function OptionsSections() {
  const pathname = usePathname();
  const [error, setError] = useState('');
  return (
    <GradientSurface tone="panel" style={ui.panel}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ui.row}>
        {['Saves', 'All', 'Lists', 'Posts', 'Comments'].map((label) => {
          const path = label === 'Saves' ? '/saves' : `/saves/${label.toLowerCase()}`;
          return (
            <Pressable key={path} accessibilityRole="link" accessibilityState={{ selected: pathname === path }}
              onPress={() => void openPage(path).catch((err) => setError(errorText(err)))}
              style={ui.button}>
              <GradientBackground tone={pathname === path ? 'silver' : 'green'} />
              <Text style={[ui.buttonText, { fontSize: 24 }]}>{label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {error ? <CopyableError message={error} /> : null}
    </GradientSurface>
  );
}
