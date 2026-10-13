import { useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiRequest } from '../../lib/api';
import CopyableError from './copyable-error';
import { notifySaveChanged } from '@/shared/save-changes';

interface AddSaveResponse {
  status?: string;
  message?: string;
  comment_id?: string;
  post_id?: string;
}

export default function AddSaveSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AddSaveResponse | null>(null);
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const close = () => {
    if (busy) return;
    setError('');
    setResult(null);
    onClose();
  };

  const save = async () => {
    const url = link.trim();
    setResult(null);
    if (!url) {
      setError('Please enter a post or comment URL.');
      return;
    }

    const host = url.match(/^https?:\/\/([^/?#]+)/i)?.[1]?.toLowerCase().replace(/:\d+$/, '');
    const isHost = (domain: string) => host === domain || host?.endsWith(`.${domain}`);
    const isReddit = isHost('reddit.com') || isHost('redd.it');
    const isVideo = isHost('youtube.com') || isHost('youtu.be') || isHost('tiktok.com') || isHost('instagram.com');
    if (!isReddit && !isVideo) {
      setError('Enter a Reddit, YouTube, TikTok, or Instagram URL.');
      return;
    }
    const redditPath = isReddit ? new URL(url).pathname : '';
    const commentMatch = redditPath.match(/\/comment\/([^/]+)(?:\/|$)|\/comments\/[^/]+\/[^/]+\/([^/]+)(?:\/|$)/i);
    const isComment = commentMatch != null;

    setBusy(true);
    setError('');
    setResult(null);
    try {
      if (isReddit) {
        const response = await apiRequest<AddSaveResponse>('addSaveREDDIT', 'POST', { arg_URL: url }, 120000);
        if (response.status === 'error') throw new Error(response.message || 'Adding the save failed.');
        setResult({ ...response,
          comment_id: isComment ? response.comment_id ?? commentMatch?.[1] ?? commentMatch?.[2] : response.comment_id,
          message: response.message || (isComment ? 'Comment added successfully.' : 'Post added successfully.'),
        });
        if (response.status !== 'alert') notifySaveChanged();
      } else {
        const response = await apiRequest<string>('addSaveYTDLP', 'POST', { arg_URL: url }, 300000);
        setResult({ status: 'success', message: typeof response === 'string' && response.trim() ? response.trim() : 'Video saved successfully.' });
        notifySaveChanged();
      }
      setLink('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Adding the save failed.');
    } finally {
      setBusy(false);
    }
  };

  const openSave = (type: 'posts' | 'comments', id: string) => {
    close();
    router.push(`/saves/${type}/${encodeURIComponent(id)}` as never);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <Pressable accessibilityLabel="Close Add panel" accessibilityRole="button" onPress={close} style={StyleSheet.absoluteFill} />
        <View style={[styles.sheet, { height: height * 0.7, paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.handle} />
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
            <Text accessibilityRole="header" style={styles.title}>Add post or comment</Text>
            <Text style={styles.description}>Enter a Reddit, YouTube, TikTok, or Instagram URL</Text>
            <TextInput
              accessibilityLabel="Post or comment URL"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              placeholder="https://..."
              value={link}
              onChangeText={setLink}
              style={styles.input}
            />
            <View style={styles.actions}>
              <Pressable accessibilityRole="button" disabled={busy} onPress={close} style={[styles.button, styles.cancelButton]}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable accessibilityRole="button" disabled={busy} onPress={() => void save()} style={[styles.button, styles.saveButton, busy && styles.disabled]}>
                {busy ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.saveText}>Save</Text>}
              </Pressable>
            </View>
            {error ? <CopyableError message={error} /> : null}
            {result ? (
              <View style={styles.result}>
                <Text style={styles.resultTitle}>{result.status === 'alert' ? 'Alert' : 'Success'}</Text>
                <Text style={styles.resultText}>{result.message}</Text>
                <View style={styles.actions}>
                  {result.comment_id && result.comment_id !== 'nada' ? (
                    <Pressable accessibilityRole="button" onPress={() => openSave('comments', result.comment_id!)} style={[styles.button, styles.saveButton]}>
                      <Text style={styles.saveText}>Go to comment</Text>
                    </Pressable>
                  ) : null}
                  {result.post_id ? (
                    <Pressable accessibilityRole="button" onPress={() => openSave('posts', result.post_id!)} style={[styles.button, styles.saveButton]}>
                      <Text style={styles.saveText}>Go to post</Text>
                    </Pressable>
                  ) : null}
                  <Pressable accessibilityRole="button" onPress={close} style={[styles.button, styles.cancelButton]}>
                    <Text style={styles.cancelText}>Close</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  sheet: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 10 },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#9ca3af', marginBottom: 12 },
  content: { gap: 14, paddingBottom: 8 },
  title: { color: '#111827', fontSize: 20, fontWeight: '600' },
  description: { color: '#4b5563', fontSize: 15 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, color: '#111827' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  button: { minHeight: 44, borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' },
  cancelButton: { borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#ffffff' },
  saveButton: { backgroundColor: '#2563eb' },
  cancelText: { color: '#111827', fontWeight: '600' },
  saveText: { color: '#ffffff', fontWeight: '600' },
  disabled: { opacity: 0.6 },
  result: { gap: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  resultTitle: { color: '#111827', fontSize: 18, fontWeight: '600' },
  resultText: { color: '#374151', fontSize: 15 },
});
