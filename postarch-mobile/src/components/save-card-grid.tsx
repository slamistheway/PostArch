import { useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import type { AllInterface, ListInterface } from '@/types/types';
import { addSaveToList, errorText, pinSave, removeSaveFromList, truncate } from '@/shared/functions';
import { Action, Dialog, openPage, ui } from './postarch-ui';
import GradientSurface, { GradientBackground } from './gradient-surface';

export interface CardProps<T extends AllInterface> {
  lists: ListInterface[];
  pinnedIDs: string[];
  isVisibleMoreOptionsPanelId: string | null;
  openOrCloseMoreOptionsSavePanel: (id: string) => void;
  isVisibleAddToListPanelId: string | null;
  setIsVisibleAddToListPanelId: Dispatch<SetStateAction<string | null>>;
  setPinnedIDs: Dispatch<SetStateAction<string[]>>;
  setErrorMessage: (message: string) => void;
  setSaveToDelete: (save: T) => void;
  setAlert_deleteSave: (visible: boolean) => void;
  setAlert_deleteForeignKeys?: (visible: boolean) => void;
}

export interface PostListsProps {
  arrayOfPostsWithTheirLists: { postId: string; listIds: number[] }[];
  setArrayOfPostsWithTheirLists: Dispatch<SetStateAction<{ postId: string; listIds: number[] }[]>>;
}

type PreviewProps<T extends AllInterface> = {
  items: T[]; mode: 'all' | 'posts' | 'comments'; columns: number; previewOnly: true;
  openOptionsId: string | null; pinnedIDs: string[]; busyId: string | null;
  onToggleOptions: (id: string) => void; onDelete: (item: T) => void;
  onPin: (item: T) => void; onAddToList: (item: T) => void;
};
type InteractiveProps<T extends AllInterface> = CardProps<T> & { items: T[]; mode?: 'all' | 'posts' | 'comments'; saveType?: 'post' | 'comment'; membership?: PostListsProps };

export default function SaveCardGrid<T extends AllInterface>(props: PreviewProps<T> | InteractiveProps<T>) {
  if ('previewOnly' in props) return <PreviewGrid {...props} />;
  return <InteractiveSaveCardGrid {...props} />;
}

function PreviewGrid<T extends AllInterface>({ items, mode, columns, openOptionsId, pinnedIDs, busyId,
  onToggleOptions, onDelete, onPin, onAddToList }: PreviewProps<T>) {
  return <View style={styles.grid}>{items.map((item) => {
    const type = mode === 'comments' || item.title == null ? 'comments' : 'posts';
    const text = item.title == null ? item.content : item.title;
    return <View key={item.id} style={{ width: `${100 / columns}%`, padding: 6 }}>
      <View style={styles.previewCard}>
        <GradientBackground tone="card" />
        <Pressable accessibilityRole="link" accessibilityLabel={`Open save by ${item.author ?? 'unknown'}`}
          onPress={() => router.push(`/saves/${type}/${encodeURIComponent(item.id)}` as never)}
          style={({ pressed }) => [styles.previewLink, pressed && styles.pressed]}>
          <View style={styles.previewHeader}>
            {mode === 'all' && (
              <Image source={type === 'posts'
                ? require('@/assets/images/icons/posts.png')
                : require('@/assets/images/icons/comments.png')} style={styles.previewIcon} />
            )}
            <Text numberOfLines={1} style={styles.author}>u/{item.author ?? 'unknown'}</Text>
          </View>
          <View style={styles.previewSummary}>
            <Text numberOfLines={4} style={styles.content}>{text?.length > 100 ? `${text.slice(0, 100)}...` : text}</Text>
          </View>
        </Pressable>
        <View style={styles.previewActions}>
          <Action label="•••" tone="neutral" onPress={() => onToggleOptions(item.id)} />
          {openOptionsId === item.id && <>
            <Action label="Delete" tone="neutral" disabled={busyId != null} onPress={() => onDelete(item)} />
            <Action label={pinnedIDs.includes(item.id) ? 'Pinned' : 'Pin'} tone="neutral" disabled={busyId != null} onPress={() => onPin(item)} />
            <Action label="Add to List" tone="neutral" disabled={busyId != null} onPress={() => onAddToList(item)} />
          </>}
        </View>
      </View>
    </View>;
  })}</View>;
}

function InteractiveSaveCardGrid<T extends AllInterface>({
  items, mode, saveType, lists, pinnedIDs, isVisibleMoreOptionsPanelId,
  openOrCloseMoreOptionsSavePanel, isVisibleAddToListPanelId,
  setIsVisibleAddToListPanelId, setPinnedIDs, setErrorMessage,
  setSaveToDelete, setAlert_deleteSave, membership,
}: InteractiveProps<T>) {
  const { width } = useWindowDimensions();
  const columns = width >= 900 ? 4 : width >= 600 ? 3 : 2;
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const selected = items.find((item) => item.id === isVisibleAddToListPanelId);
  const typeOf = (item: T) => saveType ?? (item.title == null ? 'comment' : 'post');

  const run = async (action: () => Promise<void>) => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    try {
      await action();
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(errorText(error));
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };

  const toggleList = async (item: T, listId: number) => {
    const existing = membership?.arrayOfPostsWithTheirLists.find((entry) => entry.postId === item.id);
    const included = existing?.listIds.includes(listId) ?? false;
    if (included) await removeSaveFromList(String(listId), item.id, typeOf(item));
    else await addSaveToList(String(listId), item.id, typeOf(item));
    membership?.setArrayOfPostsWithTheirLists((entries) => {
      const current = entries.find((entry) => entry.postId === item.id);
      if (!current) return [...entries, { postId: item.id, listIds: [listId] }];
      return entries.map((entry) => entry.postId === item.id
        ? { ...entry, listIds: included ? entry.listIds.filter((id) => id !== listId) : [...entry.listIds, listId] }
        : entry);
    });
    setIsVisibleAddToListPanelId(null);
  };

  return (
    <>
      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.id} style={{ width: `${100 / columns}%`, padding: 6 }}>
            <GradientSurface tone="card" style={styles.card}>
              <Pressable
                  accessibilityRole="link"
                  accessibilityLabel={`Open ${typeOf(item)} by ${item.author ?? 'unknown'}`}
                  onPress={() => void openPage(`/saves/${typeOf(item) === 'post' ? 'posts' : 'comments'}/${encodeURIComponent(item.id)}`).catch((error) => setErrorMessage(errorText(error)))
                  }
                  style={styles.preview}
              >
                <View style={styles.previewHeader}>
                  {mode === 'all' && (
                    <Image source={typeOf(item) === 'post'
                      ? require('@/assets/images/icons/posts.png')
                      : require('@/assets/images/icons/comments.png')} style={styles.previewIcon} />
                  )}
                  <Text style={styles.author} numberOfLines={1}>u/{item.author ?? 'unknown'}</Text>
                </View>
                <View style={styles.summary}>
                  <Text style={styles.content} numberOfLines={4}>{truncate(typeOf(item) === 'post' ? item.title ?? '' : item.content)}</Text>
                </View>
              </Pressable>
              <View style={styles.actions}>
                <Action label="•••" tone="neutral" onPress={() => openOrCloseMoreOptionsSavePanel(item.id)} />
                {isVisibleMoreOptionsPanelId === item.id && (
                  <>
                    <Action label="Delete" tone="neutral" disabled={busy} onPress={() => { setSaveToDelete(item); setAlert_deleteSave(true); }} />
                    <Action label={pinnedIDs.includes(item.id) ? 'Pinned' : 'Pin'} tone="neutral" disabled={busy}
                      onPress={() => void run(async () => {
                        await pinSave(item.id, typeOf(item));
                        setPinnedIDs((ids) => ids.includes(item.id) ? ids.filter((id) => id !== item.id) : [...ids, item.id]);
                      })} />
                    <Action label="Add to List" tone="neutral" disabled={busy} onPress={() => setIsVisibleAddToListPanelId(item.id)} />
                  </>
                )}
              </View>
            </GradientSurface>
          </View>
        ))}
      </View>
      {selected && (
        <Dialog title="Add to List" onClose={() => { if (!busy) setIsVisibleAddToListPanelId(null); }}>
          {lists.length ? lists.map((list) => {
            const included = membership?.arrayOfPostsWithTheirLists.some((entry) => entry.postId === selected.id && entry.listIds.includes(list.id));
            return <Action key={list.id} label={`${list.name}${included ? ' ✓ — Remove' : ''}`} disabled={busy}
              onPress={() => void run(() => toggleList(selected, list.id))} />;
          }) : <Text style={ui.text}>No lists available.</Text>}
          <Action label="Cancel" disabled={busy} onPress={() => setIsVisibleAddToListPanelId(null)} />
        </Dialog>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  previewCard: { minHeight: 150, borderRadius: 16, paddingHorizontal: 8, paddingTop: 4, alignItems: 'center', overflow: 'hidden', boxShadow: '0 20px 25px rgba(0,0,0,0.15)' },
  previewLink: { flexGrow: 1, alignItems: 'center' },
  previewActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4, paddingBottom: 4 },
  previewHeader: { flexDirection: 'row', alignItems: 'center' },
  previewSummary: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 4 },
  previewIcon: { width: 16, height: 16, resizeMode: 'contain', marginTop: 3 },
  pressed: { opacity: 0.7 },
  card: { borderRadius: 16, boxShadow: '0 20px 25px rgba(0,0,0,0.15)' },
  preview: { minHeight: 106, paddingHorizontal: 8, paddingTop: 4, alignItems: 'center' },
  author: { fontWeight: '700', color: '#1f2937', marginBottom: 4, fontSize: 16 },
  summary: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 4 },
  content: { color: '#4b5563', textAlign: 'center', lineHeight: 22, fontSize: 16, fontWeight: '600', flexShrink: 1 },
  actions: { padding: 4, flexDirection: 'row', flexWrap: 'wrap', gap: 4, backgroundColor: '#e5e7eb', borderRadius: 12 },
});
