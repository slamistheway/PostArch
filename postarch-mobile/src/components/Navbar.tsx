import { useState } from 'react';
import { StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { Action, openPage } from './postarch-ui';
import GradientSurface from './gradient-surface';
import { errorText } from '@/shared/functions';
import CopyableError from './copyable-error';

export default function Navbar({ searchValue, onSearchChange, showSearchButton = true }: {
  searchValue?: string; onSearchChange?: (value: string) => void; showSearchButton?: boolean;
} = {}) {
  const [localSearch, setLocalSearch] = useState('');
  const [error, setError] = useState('');
  const { width } = useWindowDimensions();
  const search = searchValue ?? localSearch;
  const setSearch = onSearchChange ?? setLocalSearch;
  const navigate = (path: string) => void openPage(path).catch((err) => setError(errorText(err)));
  return (
    <GradientSurface tone="navbar" style={[styles.navbar, width >= 700 && styles.wide]}>
      <View style={styles.search}>
        <View style={styles.inputWrapper}>
          <View pointerEvents="none" style={styles.searchIcon}>
            <View style={styles.searchLens} />
            <View style={styles.searchHandle} />
          </View>
          <TextInput accessibilityLabel="Search posts and comments" placeholder="Pretraži objave i komentare:"
            placeholderTextColor="#6b7280" value={search} onChangeText={setSearch}
            style={styles.input} returnKeyType="search" onSubmitEditing={showSearchButton ? () => navigate('/saves/all') : undefined} />
        </View>
        {showSearchButton && <Action label="→" style={styles.searchButton} onPress={() => navigate('/saves/all')} />}
      </View>
      {error ? <CopyableError message={error} /> : null}
    </GradientSurface>
  );
}

const styles = StyleSheet.create({
  navbar: { paddingHorizontal: 24, paddingVertical: 12, gap: 12, boxShadow: '0 20px 25px rgba(0,0,0,0.15)' },
  wide: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  logo: { overflow: 'hidden', borderRadius: 32, paddingHorizontal: 24, minHeight: 44, justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-start', boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.3), inset 0 -6px 4px rgba(40,90,35,0.25)' },
  brand: { fontSize: 22, letterSpacing: 0.5 },
  search: { flexDirection: 'row', flexGrow: 1, flexShrink: 1, gap: 4, maxWidth: 576, minHeight: 44, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.2)' },
  inputWrapper: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#6b7280', backgroundColor: '#ffffff', borderRadius: 999 },
  input: { flex: 1, minWidth: 0, paddingLeft: 32, paddingRight: 8, paddingVertical: 6, color: '#111827', fontSize: 18, fontWeight: '600' },
  searchButton: { width: 44, height: 44, paddingHorizontal: 0, borderRadius: 999 },
  searchIcon: { position: 'absolute', left: 10, top: 12, width: 18, height: 18 },
  searchLens: { width: 12, height: 12, borderWidth: 2, borderColor: '#6b7280', borderRadius: 6 },
  searchHandle: { width: 8, height: 2, backgroundColor: '#6b7280', position: 'absolute', left: 9, top: 12, transform: [{ rotate: '45deg' }] },
});
