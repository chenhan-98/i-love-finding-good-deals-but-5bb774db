import { useEffect, useState } from 'react';
import { Linking, ScrollView, Share, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Snackbar, Text, useTheme } from 'react-native-paper';

import { DealCard } from '@/components/DealCard';
import { fetchFavorites, recordShare, removeFavorite } from '@/lib/api';
import type { Deal } from '@/types/deals';

export default function FavoritesScreen() {
  const theme = useTheme();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbarText, setSnackbarText] = useState('');

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const favorites = await fetchFavorites();
      setDeals(favorites.map((item) => item.deal));
    } catch {
      setSnackbarText('Unable to load saved deals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const onRemoveFavorite = async (deal: Deal) => {
    try {
      await removeFavorite(deal.id);
      setDeals((prev) => prev.filter((item) => item.id !== deal.id));
      setSnackbarText('Removed from favorites.');
    } catch {
      setSnackbarText('Could not remove favorite.');
    }
  };

  const onShareDeal = async (deal: Deal) => {
    const message = `${deal.title} is ${deal.discount_percent}% off on ${deal.marketplace}. ${deal.product_url}`;

    try {
      await Share.share({ message });
      await recordShare({ deal_id: deal.id, channel: 'native_share', message });
    } catch {
      setSnackbarText('Could not share this deal.');
    }
  };

  const onOpenDeal = async (deal: Deal) => {
    try {
      await Linking.openURL(deal.product_url);
    } catch {
      setSnackbarText('Could not open the product link.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          Saved Deals
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Your hand-picked discounts for quick checkout later.
        </Text>

        {loading ? (
          <ActivityIndicator style={styles.loader} />
        ) : deals.length === 0 ? (
          <Text style={[styles.emptyState, { color: theme.colors.onSurfaceVariant }]}>No favorites yet.</Text>
        ) : (
          deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              isFavorite
              onToggleFavorite={onRemoveFavorite}
              onShare={onShareDeal}
              onOpen={onOpenDeal}
            />
          ))
        )}
      </ScrollView>

      <Snackbar visible={Boolean(snackbarText)} onDismiss={() => setSnackbarText('')} duration={2200}>
        {snackbarText}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 26,
    gap: 12,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    lineHeight: 21,
    marginBottom: 6,
  },
  loader: {
    marginTop: 24,
  },
  emptyState: {
    marginTop: 24,
  },
});
