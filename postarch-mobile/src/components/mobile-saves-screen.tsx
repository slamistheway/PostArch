import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { apiRequest } from '../../lib/api';
import type { AllInterface, CommentInterface, ListInterface, PostInterface } from '@/types/types';
import GradientSurface, { GradientBackground } from './gradient-surface';
import { Action, Dialog, ui } from './postarch-ui';
import CopyableError from './copyable-error';
import Navbar from './Navbar';
import SaveCardGrid from './save-card-grid';
import FiltersSection from './Filters-section';
import Alert_DeleteSave from './modals/Alert_DeleteSave';
import Alert_DeleteSaveForeignKey from './modals/Alert_DeleteSaveForeignKey';
import { addSaveToList, initializePinnedIds, pinSave, removeSaveFromList } from '@/shared/functions';
import { notifySaveChanged, subscribeToSaveChanges } from '@/shared/save-changes';
import PinWarningToast from './pin-warning-toast';

type SaveItem = AllInterface | PostInterface | CommentInterface;
type Item = SaveItem | ListInterface;
type Mode = 'all' | 'posts' | 'comments' | 'lists';

const config: Record<Mode, string> = { all: 'all', posts: 'posts', comments: 'comments', lists: 'lists' };
const isList = (item: Item): item is ListInterface => 'name' in item;

export default function MobileSavesScreen({ mode = 'all' }: { mode?: Mode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [pinnedIDs, setPinnedIDs] = useState<string[]>([]);
  const [pinWarning, setPinWarning] = useState('');
  const [openOptionsId, setOpenOptionsId] = useState<string | null>(null);
  const [saveToDelete, setSaveToDelete] = useState<SaveItem | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [showLinkedComments, setShowLinkedComments] = useState(false);
  const [listTarget, setListTarget] = useState<SaveItem | null>(null);
  const [lists, setLists] = useState<ListInterface[]>([]);
  const [memberListIds, setMemberListIds] = useState<number[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showCreateList, setShowCreateList] = useState(false);
  const [listName, setListName] = useState('');
  const [createError, setCreateError] = useState('');
  const [creatingList, setCreatingList] = useState(false);
  const loadVersion = useRef(0);
  const { width } = useWindowDimensions();
  const columns = width >= 900 ? 4 : width >= 600 ? 3 : 2;

  const load = useCallback(async () => {
    const version = ++loadVersion.current;
    setLoading(true);
    setError('');
    try {
      const [data, pins] = await Promise.all([
        apiRequest<Item[]>(`${config[mode]}${mode === 'all' ? '' : '?pageType=savesPage'}`),
        initializePinnedIds(),
      ]);
      if (version === loadVersion.current) {
        setItems(Array.isArray(data) ? data : []);
        setPinnedIDs(Array.isArray(pins) ? pins : []);
      }
    } catch (reason) {
      if (version === loadVersion.current) setError(reason instanceof Error ? reason.message : 'Failed to load saves.');
    } finally {
      if (version === loadVersion.current) setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    // Initial data synchronization belongs to this screen lifecycle.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    const unsubscribe = subscribeToSaveChanges(() => { void load(); });
    const versionRef = loadVersion;
    return () => { unsubscribe(); versionRef.current++; };
  }, [load]);

  const dismissPinWarning = useCallback(() => setPinWarning(''), []);

  const visible = items.filter((item) => {
    const text = isList(item) ? item.name : `${item.author ?? ''} ${'title' in item ? item.title ?? '' : ''} ${item.content ?? ''}`;
    return text.toLowerCase().includes(query.toLowerCase());
  });

  const typeOf = (item: SaveItem) => 'title' in item && item.title != null ? 'post' : 'comment';
  const pin = async (item: SaveItem) => {
    setBusyId(item.id);
    setError('');
    try {
      await pinSave(item.id, typeOf(item));
      setPinnedIDs((ids) => ids.includes(item.id) ? ids.filter((id) => id !== item.id) : [...ids, item.id]);
      notifySaveChanged();
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Failed to pin save.';
      if (message.includes('Maximum')) setPinWarning('Maximum number of pinned posts and comments (4) reached.');
      else setError(message);
    } finally {
      setBusyId(null);
    }
  };

  const openLists = async (item: SaveItem) => {
    setBusyId(item.id);
    setError('');
    try {
      const [available, membership] = await Promise.all([
        apiRequest<ListInterface[]>('lists'),
        apiRequest<number[]>(`saveLists/${typeOf(item)}/${encodeURIComponent(item.id)}`),
      ]);
      setLists(available);
      setMemberListIds(membership);
      setListTarget(item);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to load lists.');
    } finally {
      setBusyId(null);
    }
  };

  const toggleList = async (list: ListInterface) => {
    if (!listTarget) return;
    setBusyId(listTarget.id);
    setError('');
    try {
      const included = memberListIds.includes(list.id);
      if (included) await removeSaveFromList(String(list.id), listTarget.id, typeOf(listTarget));
      else await addSaveToList(String(list.id), listTarget.id, typeOf(listTarget));
      setMemberListIds((ids) => included ? ids.filter((id) => id !== list.id) : [...ids, list.id]);
      setListTarget(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to update list.');
    } finally {
      setBusyId(null);
    }
  };

  const onDeleted = (id: string, withComments: boolean) => {
    setItems((current) => current.filter((item) => item.id !== id &&
      !(withComments && 'post_id' in item && item.post_id === id)));
    setPinnedIDs((ids) => ids.filter((pinnedId) => pinnedId !== id));
    setSaveToDelete(null);
    setOpenOptionsId(null);
  };

  const createList = async () => {
    const name = listName.trim();
    if (!name) {
      setCreateError('Please enter a list name.');
      return;
    }
    setCreatingList(true);
    setCreateError('');
    try {
      const response = await apiRequest<ListInterface[] | ListInterface>('createList', 'POST', { arg_ListName: name });
      const created = Array.isArray(response) ? response[0] : response;
      if (created?.id == null) throw new Error('List was created, but its details could not be loaded.');
      setItems((current) => [...current, created]);
      setListName('');
      setShowCreateList(false);
    } catch (reason) {
      setCreateError(reason instanceof Error ? reason.message : 'Failed to create list.');
    } finally {
      setCreatingList(false);
    }
  };

  return (
    <View style={styles.page}>
      <Image source={require('@/assets/images/home/bamboo.png')} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void load()} tintColor="#ffffff" />}>
          <Navbar searchValue={query} onSearchChange={setQuery} showSearchButton={false} />
          <View style={[styles.pageBody, width >= 900 && styles.wideBody]}>
            <FiltersSection />
            <GradientSurface tone="glass" style={styles.section}>
              <View style={ui.row}>
                {(['all', 'posts', 'comments', 'lists'] as Mode[]).map((tab) => (
                  <Action key={tab} label={tab} tone={tab === mode ? 'silver' : 'green'}
                    style={tab === mode ? styles.selectedTab : undefined}
                    onPress={() => router.push(`/saves/${tab}` as never)} />
                ))}
              </View>
              {error ? <CopyableError message={error} /> : null}
              {loading && !items.length ? <ActivityIndicator color="#ffffff" /> : null}
              {mode === 'lists'
                ? <>
                    <ListGrid lists={visible.filter(isList)} columns={columns} />
                    <Action label="+ Add list" tone="green" style={styles.addListButton}
                      onPress={() => { setCreateError(''); setShowCreateList(true); }} />
                  </>
                : <SaveCardGrid items={visible.filter((item): item is SaveItem => !isList(item))} mode={mode} columns={columns} previewOnly
                  openOptionsId={openOptionsId} pinnedIDs={pinnedIDs} busyId={busyId}
                  onToggleOptions={(id) => setOpenOptionsId((current) => current === id ? null : id)}
                  onDelete={(item) => { setSaveToDelete(item); setShowDelete(true); }}
                  onPin={(item) => void pin(item)} onAddToList={(item) => void openLists(item)} />}
              {!loading && !visible.length ? <Text style={styles.empty}>No saves found.</Text> : null}
            </GradientSurface>
          </View>
        </ScrollView>
      </SafeAreaView>
      <PinWarningToast message={pinWarning} onDismiss={dismissPinWarning} />
      {listTarget && <Dialog title="Add to List" onClose={() => { if (!busyId) setListTarget(null); }}>
        {lists.length ? lists.map((list) => <Action key={list.id}
          label={`${list.name}${memberListIds.includes(list.id) ? ' ✓ — Remove' : ''}`}
          disabled={busyId != null} onPress={() => void toggleList(list)} />)
          : <Text style={ui.text}>No lists available.</Text>}
        <Action label="Cancel" tone="neutral" disabled={busyId != null} onPress={() => setListTarget(null)} />
      </Dialog>}
      {showDelete && <Alert_DeleteSave saveToDelete={saveToDelete} onDeleted={onDeleted} setErrorMessage={setError}
        setAlert_deleteSave={setShowDelete} setAlert_deleteForeignKeys={setShowLinkedComments} />}
      {showLinkedComments && <Alert_DeleteSaveForeignKey saveToDelete={saveToDelete} onDeleted={onDeleted}
        setErrorMessage={setError} setAlert_deleteForeignKeys={setShowLinkedComments} />}
      {showCreateList && <Dialog title="Create list" onClose={() => { if (!creatingList) setShowCreateList(false); }}>
        <TextInput accessibilityLabel="List name" placeholder="List name" value={listName}
          onChangeText={setListName} autoFocus maxLength={100} style={ui.input} />
        {createError ? <CopyableError message={createError} /> : null}
        <View style={ui.row}>
          <Action label="Cancel" tone="neutral" disabled={creatingList} onPress={() => setShowCreateList(false)} />
          <Action label={creatingList ? 'Creating…' : 'Create'} tone="blue" disabled={creatingList}
            onPress={() => void createList()} />
        </View>
      </Dialog>}
    </View>
  );
}

function ListGrid({ lists, columns }: { lists: ListInterface[]; columns: number }) {
  return <View style={styles.grid}>{lists.map((list) => (
    <View key={list.id} style={{ width: `${100 / columns}%`, padding: 6 }}>
      <Pressable accessibilityRole="link" accessibilityLabel={`Open list ${list.name}`}
        onPress={() => router.push(`/saves/lists/${list.id}` as never)}
        style={({ pressed }) => [styles.listCard, pressed && styles.pressed]}>
        <GradientBackground tone="card" />
        <Text numberOfLines={1} style={styles.listTitle}>{list.name}</Text>
        <Image source={require('@/assets/images/icons/list.png')} style={styles.listImage} />
      </Pressable>
    </View>
  ))}</View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#345b2b' },
  safeArea: { flex: 1 },
  content: { paddingBottom: 100, width: '100%' },
  pageBody: { padding: 16, gap: 16, width: '100%', maxWidth: 1400, alignSelf: 'center' },
  wideBody: { paddingHorizontal: 32, paddingTop: 20 },
  section: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', borderRadius: 24, padding: 12, gap: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.18)' },
  selectedTab: { borderWidth: 1, borderColor: '#ffffff' },
  addListButton: { alignSelf: 'flex-start', borderRadius: 999 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  listCard: { height: 190, borderRadius: 16, padding: 8, alignItems: 'center', overflow: 'hidden', boxShadow: '0 20px 25px rgba(0,0,0,0.15)' },
  listTitle: { color: '#1f2937', fontWeight: '700', fontSize: 16, textAlign: 'center' },
  listImage: { width: '100%', flex: 1, resizeMode: 'contain' },
  pressed: { opacity: 0.7 },
  empty: { color: '#ffffff', padding: 16, textAlign: 'center' },
});
