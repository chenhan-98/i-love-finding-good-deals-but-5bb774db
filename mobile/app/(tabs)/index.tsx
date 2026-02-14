import { useEffect, useMemo, useState } from 'react';
import { Linking, ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Button,
  Chip,
  Searchbar,
  Snackbar,
  Text,
  useTheme,
} from 'react-native-paper';

import { DealCard } from '@/components/DealCard';
import {
  addFavorite,
  fetchCategories,
  fetchDeals,
  fetchFavorites,
  recordShare,
  refreshDeals,
  removeFavorite,
} from '@/lib/api';
import type { Deal } from '@/types/deals';

const marketplaceFilters = ['All', 'Amazon', 'Walmart', 'Target'];

export default function DiscoverScreen() {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [selectedMarketplace, setSelectedMarketplace] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minDiscount, setMinDiscount] = useState(10);

  const [categories, setCategories] = useState<string[]>(['All']);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [snackbarText, setSnackbarText] = useState('');

  const discountLevels = useMemo(() => [0, 10, 20, 30, 40], []);

  const loadCategories = async () => {
    const fetchedCategories = await fetchCategories();
    setCategories(['All', ...fetchedCategories]);
  };

  const loadDeals = async () => {
    const result = await fetchDeals({
      q: search.trim() || undefined,
      category: selectedCategory,
      marketplace: selectedMarketplace,
      minDiscount,
    });
    setDeals(result.deals);
  };

  const loadFavorites = async () => {
    const favorites = await fetchFavorites();
    setFavoriteIds(new Set(favorites.map((item) => item.deal_id)));
  };

  const bootstrap = async () => {
    try {
      setLoading(true);
      await Promise.all([loadCategories(), loadDeals(), loadFavorites()]);
    } catch {
      setSnackbarText('Unable to load deals right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadDeals().catch(() => setSnackbarText('Failed to update search results.'));
    }, 280);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedMarketplace, selectedCategory, minDiscount]);

  const onRefreshDeals = async () => {
    try {
      setLoading(true);
      await refreshDeals();
      await loadDeals();
      setSnackbarText('Fresh deals pulled from marketplaces 🎉');
    } catch {
      setSnackbarText('Could not refresh deals right now.');
    } finally {
      setLoading(false);
    }
  };

  const onToggleFavorite = async (deal: Deal) => {
    try {
      if (favoriteIds.has(deal.id)) {
        await removeFavorite(deal.id);
        setFavoriteIds((prev) => {
          const updated = new Set(prev);
          updated.delete(deal.id);
          return updated;
        });
        setSnackbarText('Removed from saved deals 💨');
      } else {
        await addFavorite(deal.id);
        setFavoriteIds((prev) => new Set([...prev, deal.id]));
        setSnackbarText('Deal saved to favorites 💖');
      }
    } catch {
      setSnackbarText('Unable to update favorites.');
    }
  };

  const onShareDeal = async (deal: Deal) => {
    const message = `${deal.title} is ${deal.discount_percent}% off on ${deal.marketplace}. ${deal.product_url}`;

    try {
      await Share.share({ message });
      await recordShare({ deal_id: deal.id, channel: 'native_share', message });
    } catch {
      setSnackbarText('Share failed. Try again 😅');
    }
  };

  const onOpenDeal = async (deal: Deal) => {
    try {
      await Linking.openURL(deal.product_url);
    } catch {
      setSnackbarText('Unable to open the deal link.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text variant="headlineMedium" style={styles.heroTitle}>
          Deal Radar 🛍️
        </Text>
        <Text variant="bodyMedium" style={[styles.heroSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          Scan Walmart, Target, and Amazon in one stream ✨ Filter smarter, save faster.
        </Text>

        <Searchbar
          value={search}
          onChangeText={setSearch}
          placeholder="🔎 Search products, brands, and categories"
          style={styles.searchBar}
        />

        <View style={styles.section}>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            Marketplace 🏬
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalFilters}>
            <View style={styles.chipRow}>
              {marketplaceFilters.map((value) => (
                <Chip
                  key={value}
                  selected={selectedMarketplace === value}
                  onPress={() => setSelectedMarketplace(value)}
                  compact
                >
                  {value}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            Category 🗂️
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalFilters}>
            <View style={styles.chipRow}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  selected={selectedCategory === category}
                  onPress={() => setSelectedCategory(category)}
                  compact
                >
                  {category}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            Min Discount 🔖
          </Text>
          <View style={styles.chipRow}>
            {discountLevels.map((level) => (
              <Chip key={String(level)} selected={minDiscount === level} onPress={() => setMinDiscount(level)} compact>
                <Text>{level}%+</Text>
              </Chip>
            ))}
          </View>
        </View>

        <Button mode="contained" onPress={onRefreshDeals} style={styles.refreshButton}>
          <Text>Refresh Marketplace Deals 🔄</Text>
        </Button>

        {loading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              isFavorite={favoriteIds.has(deal.id)}
              onToggleFavorite={onToggleFavorite}
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
    paddingBottom: 24,
    gap: 14,
  },
  heroTitle: {
    fontWeight: '700',
  },
  heroSubtitle: {
    lineHeight: 22,
  },
  searchBar: {
    borderRadius: 14,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    letterSpacing: 0.2,
  },
  horizontalFilters: {
    flexGrow: 0,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  refreshButton: {
    borderRadius: 12,
  },
  loader: {
    marginTop: 18,
  },
});
