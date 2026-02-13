import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Text, useTheme } from 'react-native-paper';

import type { Deal } from '@/types/deals';

interface DealCardProps {
  deal: Deal;
  isFavorite?: boolean;
  onToggleFavorite: (deal: Deal) => void;
  onShare: (deal: Deal) => void;
  onOpen: (deal: Deal) => void;
}

export function DealCard({
  deal,
  isFavorite = false,
  onToggleFavorite,
  onShare,
  onOpen,
}: DealCardProps) {
  const theme = useTheme();

  return (
    <Card style={styles.card} mode="elevated">
      <Image source={{ uri: deal.image_url }} style={styles.image} resizeMode="cover" />
      <Card.Content style={styles.content}>
        <View style={styles.badgeRow}>
          <Chip compact icon="store" style={styles.chip}>
            {deal.marketplace}
          </Chip>
          <Chip compact style={[styles.discountChip, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text style={{ color: theme.colors.onSurface }}>🔥 {deal.discount_percent}% OFF</Text>
          </Chip>
        </View>

        <Text variant="titleMedium" style={styles.title}>
          {deal.title}
        </Text>

        <View style={styles.priceRow}>
          <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
            ${deal.price.toFixed(2)}
          </Text>
          <Text style={[styles.originalPrice, { color: theme.colors.onSurfaceVariant }]}>
            ${deal.original_price.toFixed(2)}
          </Text>
        </View>

        <Text style={[styles.category, { color: theme.colors.onSurfaceVariant }]}>{deal.category}</Text>
      </Card.Content>

      <Card.Actions style={styles.actions}>
        <Button mode={isFavorite ? 'contained' : 'outlined'} onPress={() => onToggleFavorite(deal)}>
          {isFavorite ? 'Saved 💚' : 'Save 🤍'}
        </Button>
        <Button mode="text" onPress={() => onShare(deal)}>
          <Text>Share 📤</Text>
        </Button>
        <Pressable style={styles.linkButton} onPress={() => onOpen(deal)}>
          <Text style={{ color: theme.colors.secondary }}>Open 🔗</Text>
        </Pressable>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
  },
  content: {
    gap: 10,
    paddingTop: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chip: {
    height: 32,
  },
  discountChip: {
    height: 32,
  },
  title: {
    lineHeight: 22,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    fontSize: 15,
    marginTop: 4,
  },
  category: {
    fontSize: 13,
  },
  actions: {
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  linkButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
});
