import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  Card,
  Snackbar,
  Switch,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

import { createAlert, fetchAlerts, updateAlert } from '@/lib/api';
import type { DealAlert } from '@/types/deals';

export default function AlertsScreen() {
  const theme = useTheme();
  const [alerts, setAlerts] = useState<DealAlert[]>([]);
  const [query, setQuery] = useState('');
  const [alertType, setAlertType] = useState<'product' | 'category'>('product');
  const [minDiscount, setMinDiscount] = useState('20');
  const [isEnabled, setIsEnabled] = useState(true);
  const [snackbarText, setSnackbarText] = useState('');

  const loadAlerts = async () => {
    try {
      const data = await fetchAlerts();
      setAlerts(data);
    } catch {
      setSnackbarText('Unable to load alerts.');
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const onCreateAlert = async () => {
    if (!query.trim()) {
      setSnackbarText('Enter a product or category name first.');
      return;
    }

    try {
      const alert = await createAlert({
        alert_type: alertType,
        query: query.trim(),
        min_discount: Number(minDiscount) || 0,
        is_enabled: isEnabled,
      });
      setAlerts((prev) => [alert, ...prev]);
      setQuery('');
      setSnackbarText('Alert created successfully.');
    } catch {
      setSnackbarText('Unable to create alert.');
    }
  };

  const onToggleAlert = async (alert: DealAlert, value: boolean) => {
    try {
      const updated = await updateAlert(alert.id, { is_enabled: value });
      setAlerts((prev) => prev.map((item) => (item.id === alert.id ? updated : item)));
    } catch {
      setSnackbarText('Unable to update alert status.');
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
            Deal Alerts
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Track specific products or categories and get notified when your discount threshold is hit.
          </Text>

          <Card mode="elevated" style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <TextInput
                label="Product or category"
                value={query}
                onChangeText={setQuery}
                mode="outlined"
              />
              <View style={styles.row}>
                <Button
                  mode={alertType === 'product' ? 'contained' : 'outlined'}
                  onPress={() => setAlertType('product')}
                >
                  <Text>Product</Text>
                </Button>
                <Button
                  mode={alertType === 'category' ? 'contained' : 'outlined'}
                  onPress={() => setAlertType('category')}
                >
                  <Text>Category</Text>
                </Button>
              </View>
              <TextInput
                label="Minimum discount %"
                value={minDiscount}
                onChangeText={setMinDiscount}
                mode="outlined"
                keyboardType="number-pad"
              />
              <View style={styles.toggleRow}>
                <Text>Enable immediately</Text>
                <Switch value={isEnabled} onValueChange={setIsEnabled} />
              </View>
              <Button mode="contained" onPress={onCreateAlert}>
                <Text>Create Alert</Text>
              </Button>
            </Card.Content>
          </Card>

          {alerts.map((alert) => (
            <Card key={alert.id} mode="outlined">
              <Card.Content style={styles.alertRow}>
                <View style={styles.alertTextBlock}>
                  <Text variant="titleSmall">{alert.query}</Text>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>
                    {alert.alert_type} • {alert.min_discount}% minimum
                  </Text>
                </View>
                <Switch
                  value={alert.is_enabled}
                  onValueChange={(value) => onToggleAlert(alert, value)}
                />
              </Card.Content>
            </Card>
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
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTextBlock: {
    flex: 1,
    gap: 4,
  },
});
