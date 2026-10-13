import type { ReactNode } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

// Match the layered backgrounds in frontend/src/app/globals.css.
const gradients = {
  green: ['#b9ef69', '#8fd848', '#69bb35', '#5aa92c', '#84d643', '#b4ee66'],
  silver: ['#e0e0e0', '#cfcfcf', '#bdbdbd', '#b3b3b3', '#d1d1d1', '#e5e5e5'],
  panel: ['#6e7572', '#bfc5c3', '#f1f3f2'],
  navbar: ['#f1f3f2', '#bfc5c3', '#6e7572'],
  card: ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0)'],
};

export type SurfaceTone = keyof typeof gradients | 'glass';

function svgSource(tone: SurfaceTone) {
  const colors = tone === 'glass' ? [] : gradients[tone];
  const button = tone === 'green' || tone === 'silver';
  const offsets = button ? [0, 18, 48, 52, 82, 100] : colors.length === 3 ? [0, 50, 100] : [0, 100];
  const stops = colors.map((color, index) => {
    const rgba = color.match(/^rgba\((\d+),(\d+),(\d+),([\d.]+)\)$/);
    return `<stop offset="${offsets[index]}%" stop-color="${rgba ? `rgb(${rgba[1]},${rgba[2]},${rgba[3]})` : color}" stop-opacity="${rgba?.[4] ?? 1}"/>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200" preserveAspectRatio="none">
    <defs>
      <linearGradient id="base" x1="0" y1="0" x2="0" y2="1">${stops}</linearGradient>
      <radialGradient id="shine" cx="50%" cy="30%" r="55%"><stop stop-color="white" stop-opacity=".45"/><stop offset="1" stop-color="white" stop-opacity="0"/></radialGradient>
      <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1"><stop stop-color="white" stop-opacity="${button ? '.9' : '.3'}"/><stop offset=".55" stop-color="white" stop-opacity="${button ? '.45' : '.12'}"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient>
      <linearGradient id="shade" x1="0" y1="1" x2="0" y2="0"><stop stop-color="black" stop-opacity=".35"/><stop offset=".5" stop-color="black" stop-opacity=".15"/><stop offset="1" stop-color="black" stop-opacity="0"/></linearGradient>
    </defs>
    ${tone === 'glass' ? '<rect width="400" height="200" fill="white" fill-opacity=".3"/><rect y="20" width="400" height="180" rx="40" fill="url(#shade)"/><rect width="400" height="67" fill="url(#gloss)"/>' : '<rect width="400" height="200" fill="url(#base)"/>'}
    ${button ? '<rect width="400" height="200" fill="url(#shine)"/><rect x="10" y="2" width="380" height="60" rx="30" fill="url(#gloss)"/><rect x="2" y="2" width="396" height="196" rx="40" fill="none" stroke="white" stroke-opacity=".25" stroke-width="2"/>' : ''}
  </svg>`;
  return { uri: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` };
}

const sources = Object.fromEntries(
  [...Object.keys(gradients), 'glass'].map((tone) => [tone, svgSource(tone as SurfaceTone)]),
) as Record<SurfaceTone, { uri: string }>;

export function GradientBackground({ tone }: { tone: SurfaceTone }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessible={false}>
      <Image source={sources[tone]} contentFit="fill" style={StyleSheet.absoluteFill} accessible={false} />
    </View>
  );
}

export default function GradientSurface({ tone, style, children }: {
  tone: SurfaceTone; style?: StyleProp<ViewStyle>; children: ReactNode;
}) {
  return (
    <View style={[{ overflow: 'hidden' }, style]}>
      <GradientBackground tone={tone} />
      {children}
    </View>
  );
}
