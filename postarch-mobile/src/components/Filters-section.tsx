import { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { Action, Dialog, ui } from './postarch-ui';
import GradientSurface from './gradient-surface';

interface FiltersSectionProps {
  initialSubreddits?: string[];
  initialKeywords?: string[];
}

export default function FiltersSection({ initialSubreddits = [] }: FiltersSectionProps) {
  const [panel, setPanel] = useState<'order' | 'subreddits' | null>(null);
  const [orderBy, setOrderBy] = useState('Newest');
  const [subreddits, setSubreddits] = useState(initialSubreddits);
  const orderIcon = orderBy === 'Newest' ? '↓' : orderBy === 'Oldest' ? '↑' : orderBy === 'Most Liked' ? '♥↓' : '♥↑';
  return (
    <GradientSurface tone="panel" style={ui.panel}>
      <View style={ui.row}>
        <GradientSurface tone="green" style={[ui.button, { borderRadius: 999 }]}>
          <Image source={require('@/assets/images/icons/filters.png')} style={ui.buttonIcon} />
          <Text style={ui.buttonText}>Filters</Text>
        </GradientSurface>
        <Action label={orderIcon} accessibilityLabel={`Order by: ${orderBy}`} tone="silver"
          style={{ borderRadius: 999, minWidth: 48 }} onPress={() => setPanel('order')} />
        <Action label="Subreddits ⌄" tone="silver" style={{ borderRadius: 999 }} onPress={() => setPanel('subreddits')} />
      </View>
      {panel && (
        <Dialog title={panel === 'order' ? 'Order by' : 'Subreddits'} onClose={() => setPanel(null)}>
          {panel === 'order' ? ['Newest', 'Oldest', 'Most Liked', 'Least Liked'].map((value) => (
            <Action key={value} label={value} onPress={() => { setOrderBy(value); setPanel(null); }} />
          )) : subreddits.length ? subreddits.map((value) => (
            <Action key={value} label={`Remove ${value}`} onPress={() => setSubreddits((items) => items.filter((item) => item !== value))} />
          )) : <Text style={ui.text}>No subreddits selected.</Text>}
          <Action label="Close" onPress={() => setPanel(null)} />
        </Dialog>
      )}
    </GradientSurface>
  );
}
