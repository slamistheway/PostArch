import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Image, Pressable, RefreshControl,
  ScrollView, StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_URL } from '../../lib/api';
import Navbar from '@/components/Navbar';
import GradientSurface from '@/components/gradient-surface';
import CopyableError from '@/components/copyable-error';
import { Action, Dialog, openPage, ui } from '@/components/postarch-ui';
import SaveCardGrid from '@/components/save-card-grid';
import Alert_DeleteSave from '@/components/modals/Alert_DeleteSave';
import Alert_DeleteSaveForeignKey from '@/components/modals/Alert_DeleteSaveForeignKey';
import { addSaveToList, initializePinnedIds, pinSave, removeSaveFromList } from '@/shared/functions';
import { apiRequest } from '../../lib/api';
import type { AllInterface, ListInterface } from '@/types/types';
import { notifySaveChanged, subscribeToSaveChanges } from '@/shared/save-changes';
import PinWarningToast from '@/components/pin-warning-toast';

type HomeSave = AllInterface;


export default function HomeScreen() {
  const [pinned, setPinned] = useState<HomeSave[]>([]);
  const [recent, setRecent] = useState<HomeSave[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pinnedIDs, setPinnedIDs] = useState<string[]>([]);
  const [pinWarning, setPinWarning] = useState('');
  const [openOptionsId, setOpenOptionsId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [saveToDelete, setSaveToDelete] = useState<HomeSave | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [showLinkedComments, setShowLinkedComments] = useState(false);
  const [listTarget, setListTarget] = useState<HomeSave | null>(null);
  const [lists, setLists] = useState<ListInterface[]>([]);
  const [memberListIds, setMemberListIds] = useState<number[]>([]);
  const request = useRef<AbortController | null>(null);
  const { width } = useWindowDimensions();
  const columns = width >= 900 ? 4 : width >= 600 ? 3 : 2;
  const wide = width >= 900;

  const loadData = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setErrorMessage(null);
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      
      const fetchSection = async (section: string): Promise<HomeSave[]> => {
        const response = await fetch(`${API_URL.replace(/\/$/, '')}/scrapper/${section}?pageType=homePage`, {
          signal: controller.signal,
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body?.message ?? 'Failed to load data.');
        if (!Array.isArray(body)) throw new Error('Unexpected homepage response.');
        return body;
      };
      const [pinnedData, recentData, pinnedIdsData] = await Promise.all([
        fetchSection('pinned'), fetchSection('all'),
        initializePinnedIds(controller.signal),
      ]);
      if (request.current !== controller) return;
      setPinned(pinnedData);
      setRecent(recentData);
      setPinnedIDs(pinnedIdsData);
    } catch (error: unknown) {
      if (request.current !== controller) return;
      setErrorMessage(controller.signal.aborted
        ? 'Request timed out. Check your API address and connection.'
        : error instanceof Error ? error.message : 'Failed to load data.');
    } finally {
      clearTimeout(timeout);
      if (request.current === controller) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Start the initial network request and cancel it when the screen unmounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
    const unsubscribe = subscribeToSaveChanges(() => { void loadData(); });
    return () => {
      unsubscribe();
      request.current?.abort();
      request.current = null;
    };
  }, [loadData]);

  const dismissPinWarning = useCallback(() => setPinWarning(''), []);

  const typeOf = (item: HomeSave) => item.title == null ? 'comment' : 'post';
  const pin = async (item: HomeSave) => {
    setBusyId(item.id);
    setErrorMessage(null);
    try {
      await pinSave(item.id, typeOf(item));
      const wasPinned = pinnedIDs.includes(item.id);
      setPinnedIDs((ids) => wasPinned ? ids.filter((id) => id !== item.id) : [...ids, item.id]);
      setPinned((items) => wasPinned ? items.filter((saved) => saved.id !== item.id) : [...items, item]);
      notifySaveChanged();
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Failed to pin save.';
      if (message.includes('Maximum')) setPinWarning('Maximum number of pinned posts and comments (4) reached.');
      else setErrorMessage(message);
    } finally {
      setBusyId(null);
    }
  };

  const openLists = async (item: HomeSave) => {
    setBusyId(item.id);
    setErrorMessage(null);
    try {
      const [available, membership] = await Promise.all([
        apiRequest<ListInterface[]>('lists'),
        apiRequest<number[]>(`saveLists/${typeOf(item)}/${encodeURIComponent(item.id)}`),
      ]);
      setLists(available);
      setMemberListIds(membership);
      setListTarget(item);
    } catch (reason) {
      setErrorMessage(reason instanceof Error ? reason.message : 'Failed to load lists.');
    } finally {
      setBusyId(null);
    }
  };

  const toggleList = async (list: ListInterface) => {
    if (!listTarget) return;
    setBusyId(listTarget.id);
    setErrorMessage(null);
    try {
      const included = memberListIds.includes(list.id);
      if (included) await removeSaveFromList(String(list.id), listTarget.id, typeOf(listTarget));
      else await addSaveToList(String(list.id), listTarget.id, typeOf(listTarget));
      setListTarget(null);
    } catch (reason) {
      setErrorMessage(reason instanceof Error ? reason.message : 'Failed to update list.');
    } finally {
      setBusyId(null);
    }
  };

  const onDeleted = (id: string, withComments: boolean) => {
    const keep = (item: HomeSave) => item.id !== id && !(withComments && item.post_id === id);
    setPinned((items) => items.filter(keep));
    setRecent((items) => items.filter(keep));
    setPinnedIDs((ids) => ids.filter((pinnedId) => pinnedId !== id));
    setSaveToDelete(null);
    setOpenOptionsId(null);
  };


  const renderSection = (title: 'Pinned' | 'Recent', items: HomeSave[]) => (
    <GradientSurface tone="glass" style={styles.section}>
      <View style={styles.sectionHeader}>
        <Image source={title === 'Pinned'
          ? require('@/assets/images/home/pinned.png')
          : require('@/assets/images/home/recent.png')} style={styles.sectionIcon}
        />
        <Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>
        {title === 'Recent' && (
          <Pressable accessibilityRole="link" onPress={() => void openPage('/saves/all')} style={styles.more}>
            <Text style={styles.moreText}>See more</Text>
          </Pressable>
        )}
      </View>
      <SaveCardGrid items={items} mode="all" columns={columns} previewOnly
        openOptionsId={openOptionsId} pinnedIDs={pinnedIDs} busyId={busyId}
        onToggleOptions={(id) => setOpenOptionsId((current) => current === id ? null : id)}
        onDelete={(item) => { setSaveToDelete(item); setShowDelete(true); }}
        onPin={(item) => void pin(item)} onAddToList={(item) => void openLists(item)} />
      {!loading && !errorMessage && items.length === 0 && (
        <Text style={styles.empty}>No {title.toLowerCase()} saves yet.</Text>
      )}
    </GradientSurface>
  );

  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/home/bamboo.png')} style={StyleSheet.absoluteFill} resizeMode="cover" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={() => void loadData()} tintColor="#ffffff" />
          }
        >
          <Navbar />

          <View style={[styles.pageBody, wide && styles.wideBody]}>
            <View style={styles.main}>
              {errorMessage && (
                <View style={styles.errorPanel}>
                  <CopyableError message={errorMessage} />
                  <Pressable accessibilityRole="button" onPress={() => void loadData()} style={styles.retry}>
                    <Text style={styles.retryText}>Retry</Text>
                  </Pressable>
                </View>
              )}

              {loading && pinned.length === 0 && recent.length === 0 && (
                <ActivityIndicator accessibilityLabel="Loading saves" color="#ffffff" size="large" />
              )}

              {renderSection('Pinned', pinned)}
              {renderSection('Recent', recent)}

            </View>
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
      {showDelete && <Alert_DeleteSave saveToDelete={saveToDelete} onDeleted={onDeleted}
        setErrorMessage={setErrorMessage} setAlert_deleteSave={setShowDelete}
        setAlert_deleteForeignKeys={setShowLinkedComments} />}
      {showLinkedComments && <Alert_DeleteSaveForeignKey saveToDelete={saveToDelete} onDeleted={onDeleted}
        setErrorMessage={setErrorMessage} setAlert_deleteForeignKeys={setShowLinkedComments} />}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#345b2b' },
  safeArea: { flex: 1 },
  content: { paddingBottom: 100, width: '100%' },
  pageBody: { padding: 16, gap: 24, width: '100%', maxWidth: 1400, alignSelf: 'center' },
  wideBody: { flexDirection: 'row', paddingHorizontal: 32, paddingTop: 20 },
  sidebar: { width: 180 },
  main: { flex: 1, minWidth: 0, gap: 16 },
  section: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', borderRadius: 24, paddingHorizontal: 12, paddingVertical: 4, boxShadow: '0 8px 30px rgba(0,0,0,0.18)' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 6, paddingBottom: 8 },
  sectionIcon: { width: 32, height: 32, resizeMode: 'contain' },
  sectionTitle: { fontSize: 30, color: '#ffffff', fontWeight: '600', textShadowColor: 'rgba(30,60,25,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 },
  more: { marginLeft: 'auto', padding: 8 },
  moreText: { color: '#111827', textDecorationLine: 'underline', fontWeight: '600' },
  empty: { color: '#ffffff', padding: 16, textAlign: 'center' },
  errorPanel: { backgroundColor: '#fff4f2', borderRadius: 16, padding: 16, gap: 12 },
  error: { color: '#a12720' },
  retry: { alignSelf: 'flex-start', backgroundColor: '#4c8c42', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20 },
  retryText: { color: '#ffffff', fontWeight: '600' },
});
