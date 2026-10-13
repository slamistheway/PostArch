import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import GradientSurface from '@/components/gradient-surface';

export default function InfoScreen() {
  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/home/bamboo.png')} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text accessibilityRole="header" style={styles.title}>About PostArch</Text>
          <GradientSurface tone="glass" style={styles.panel}>
            <Text style={styles.heading}>A place for the things you saved</Text>
            <Text style={styles.body}>Save posts and comments, pin the ones you want nearby, and sort the rest into lists.</Text>
          </GradientSurface>
          <GradientSurface tone="glass" style={styles.panel}>
            <Text style={styles.heading}>Still taking shape</Text>
            <Text style={styles.body}>This mobile app is a work in progress. Some parts will change as we build them out.</Text>
          </GradientSurface>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#345b2b' },
  safeArea: { flex: 1 },
  content: { width: '100%', maxWidth: 700, alignSelf: 'center', padding: 16, paddingBottom: 100, gap: 16 },
  title: { color: '#ffffff', fontSize: 30, fontWeight: '600', textShadowColor: 'rgba(30,60,25,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 },
  panel: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', borderRadius: 24, padding: 20, gap: 12 },
  heading: { color: '#ffffff', fontSize: 21, fontWeight: '600' },
  body: { color: '#172b18', fontSize: 16, lineHeight: 23 },
});
