import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { apiRequest } from '../../lib/api';
import { ui } from './postarch-ui';
import CopyableError from './copyable-error';

export default function MobileListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [list, setList] = useState<Record<string, unknown> | null>(null);
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);
  const [error, setError] = useState('');
  useEffect(() => { if (!id) return; Promise.all([apiRequest<Record<string, unknown>>(`listView/${id}`), apiRequest<Array<Record<string, unknown>>>(`all?pageType=listPage&listID=${id}`)]).then(([meta, data]) => { setList(meta); setItems(data); }).catch((reason) => setError(reason instanceof Error ? reason.message : 'Failed to load list.')); }, [id]);
  if (error) return <View style={styles.center}><CopyableError message={error} /></View>;
  if (!list) return <View style={styles.center}><ActivityIndicator color="#315d2a" /></View>;
  return <ScrollView contentContainerStyle={styles.content}><Text style={ui.title}>{String(list.name ?? 'List')}</Text><Text style={ui.text}>{String(list.description ?? '')}</Text><Text style={styles.count}>{items.length} saves</Text>{items.map((item) => <View key={String(item.id)} style={styles.item}><Text style={styles.author}>u/{String(item.author ?? 'unknown')}</Text><Text style={ui.text}>{String(item.title ?? item.content ?? '')}</Text></View>)}</ScrollView>;
}
const styles = StyleSheet.create({ content: { padding: 24, gap: 16 }, center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, count: { color: '#6b7280' }, item: { padding: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,.8)' }, author: { fontWeight: '700' } });
