import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { apiRequest } from '../../lib/api';
import { Action, ui } from './postarch-ui';
import CopyableError from './copyable-error';

export default function MobileDetailScreen({ kind }: { kind: 'post' | 'comment' }) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { if (!id) return; void apiRequest<Record<string, unknown>>(`${kind === 'post' ? 'postView' : 'commentView'}/${encodeURIComponent(id)}`).then(setItem).catch((reason) => setError(reason instanceof Error ? reason.message : 'Failed to load item.')); }, [id, kind]);
  if (error) return <View style={styles.center}><CopyableError message={error} /></View>;
  if (!item) return <View style={styles.center}><ActivityIndicator color="#315d2a" /></View>;
  return <ScrollView contentContainerStyle={styles.content}><Text style={ui.title}>{String(item.title ?? (kind === 'post' ? 'Post' : 'Comment'))}</Text><Text style={styles.author}>u/{String(item.author ?? 'unknown')}</Text><Text style={ui.text}>{String(item.content ?? '')}</Text><Action label="Back to saves" tone="blue" onPress={() => { /* router back is supplied by the native header */ }} /></ScrollView>;
}
const styles = StyleSheet.create({ content: { padding: 24, gap: 16 }, center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }, author: { fontWeight: '700', color: '#374151' } });
