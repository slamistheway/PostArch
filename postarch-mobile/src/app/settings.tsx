import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import GradientSurface from '@/components/gradient-surface';
import { Action } from '@/components/postarch-ui';

export default function SettingsScreen() {
  const [galleryMessage, setGalleryMessage] = useState('');

  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/home/bamboo.png')} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text accessibilityRole="header" style={styles.title}>Settings</Text>
          <GradientSurface tone="glass" style={styles.panel}>
            <Text style={styles.heading}>Gallery</Text>
            <Text style={styles.body}>Keep images and videos from your saves on your phone.</Text>
            <Action label="Transfer images and videos to gallery" tone="silver"
              onPress={() => setGalleryMessage('Gallery transfer is coming later.')} />
            {galleryMessage ? <Text accessibilityRole="alert" style={styles.note}>{galleryMessage}</Text> : null}
          </GradientSurface>
          <GradientSurface tone="glass" style={styles.panel}>
            <Text style={styles.heading}>More settings soon</Text>
            <Text style={styles.body}>There’s nothing else to set up here yet.</Text>
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
  note: { color: '#172b18', fontSize: 14 },
});
