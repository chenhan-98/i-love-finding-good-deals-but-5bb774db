import { Stack, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

export default function NotFoundScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text variant="headlineSmall" style={styles.title}>
          This screen does not exist.
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
        >
          Check the route path or return to the Home tab.
        </Text>
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => router.replace('/')}
        >
          <Text>Go back home</Text>
        </Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 20,
    lineHeight: 22,
  },
  button: {
    alignSelf: 'flex-start',
  },
});
