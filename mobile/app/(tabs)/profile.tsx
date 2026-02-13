import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  Card,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

import { DealCard } from '@/components/DealCard';
import {
  addFavorite,
  createInterest,
  fetchInterests,
  fetchRecommendations,
  recordShare,
} from '@/lib/api';
import type { Deal, Interest } from '@/types/deals';

export default function ProfileScreen() {
  const theme = useTheme();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [recommendations, setRecommendations] = useState<Deal[]>([]);
  const [category, setCategory] = useState('Electronics');
  const [keyword, setKeyword] = useState('Apple');
  const [priority, setPriority] = useState('3');
  const [snackbarText, setSnackbarText] = useState('');

  const loadData = async () => {
    try {
      const [savedInterests, recommended] = await Promise.all([
        fetchInterests(),
        fetchRecommendations(),
      ]);
      setInterests(savedInterests);
      setRecommendations(recommended.recommendations);
    } catch {
      setSnackbarText('Could not load personalized data.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onCreateInterest = async () => {
    try {
      const interest = await createInterest({
        category: category.trim(),
        keyword: keyword.trim(),
        priority: Number(priority) || 1,
      });

      setInterests((prev) => [interest, ...prev]);
      const recommended = await fetchRecommendations();
      setRecommendations(recommended.recommendations);
      setSnackbarText('Interest saved and recommendations refreshed.');
    } catch {
      setSnackbarText('Could not save your interest right now.');
    }
  };

  const onFavorite = async (deal: Deal) => {
    try {
      await addFavorite(deal.id);
      setSnackbarText('Saved to favorites.');
    } catch {
      setSnackbarText('Unable to save favorite.');
    }
  };

  const onShare = async (deal: Deal) => {
    const message = `${deal.title} is ${deal.discount_percent}% off on ${deal.marketplace}. ${deal.product_url}`;
    try {
      await Share.share({ message });
      await recordShare({ deal_id: deal.id, channel: 'native_share', message });
    } catch {
      setSnackbarText('Unable to share deal.');
    }
  };

  const onOpen = async (deal: Deal) => {
    try {
      await Linking.openURL(deal.product_url);
    } catch {
      setSnackbarText('Unable to open deal link.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text variant="headlineSmall" style={styles.title}>
            Personalization Lab
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Teach Deal Radar your shopping style for better recommendations.
          </Text>

          <Card mode="elevated" style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <TextInput label="Category" value={category} onChangeText={setCategory} mode="outlined" />
              <TextInput label="Keyword" value={keyword} onChangeText={setKeyword} mode="outlined" />
              <TextInput
                label="Priority (1-5)"
                value={priority}
                onChangeText={setPriority}
                keyboardType="number-pad"
                mode="outlined"
              />
              <Button mode="contained" onPress={onCreateInterest}>
                <Text>Save Interest</Text>
              </Button>
            </Card.Content>
          </Card>

          <Text variant="titleMedium">Current Interests</Text>
          <View style={styles.interestList}>
            {interests.map((interest) => (
              <Card key={interest.id} mode="outlined">
                <Card.Content>
                  <Text variant="titleSmall">{interest.category}</Text>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>
                    keyword: {interest.keyword} • priority {interest.priority}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </View>

          <Text variant="titleMedium">Recommended Deals</Text>
          {recommendations.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              onToggleFavorite={onFavorite}
              onShare={onShare}
              onOpen={onOpen}
            />
          ))}
        </ScrollView>
      </KeyboardAvoidingView>

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
  keyboardContainer: {
    flex: 1,
  },
  content: {
    padding: 18,
    gap: 12,
    paddingBottom: 24,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    lineHeight: 21,
  },
  card: {
    borderRadius: 16,
  },
  cardContent: {
    gap: 12,
  },
  interestList: {
    gap: 8,
  },
});
