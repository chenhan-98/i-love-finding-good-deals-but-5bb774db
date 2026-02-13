/**
 * CRITICAL: DO NOT MODIFY THIS FILE
 *
 * This is a system component required for Appifex sandbox switching functionality.
 * This button allows users to switch back to the Appifex sandbox app from any target app.
 *
 * Modifying or removing this file will break the core Appifex functionality.
 *
 * NOTE: This component only renders on iOS and Android. It returns null on web
 * because expo-secure-store and expo-updates are not supported on web.
 */
import React, { useState, useCallback } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
  View,
  ActivityIndicator,
  Modal,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Updates from 'expo-updates';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import type * as SecureStoreType from 'expo-secure-store';

// Check if running in Expo Go (where channel switching isn't available)
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// SecureStore is only available on iOS and Android
const SecureStore: typeof SecureStoreType | null =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Platform.OS !== 'web' ? require('expo-secure-store') : null;

// SecureStore keys for cross-app navigation
const RETURN_PROJECT_ID_KEY = 'appifex_return_project_id';
const INITIAL_ROUTE_KEY = 'appifex_initial_route';
const SWITCH_STATE_KEY = 'appifex_switch_state';

// Safe wrapper - setUpdateRequestHeadersOverride throws in dev client builds
function safeSetHeadersOverride(headers: Record<string, string> | null): void {
  try {
    Updates.setUpdateRequestHeadersOverride(headers);
  } catch {
    // Not available in dev client builds - ignore
  }
}

/**
 * Clear switch state and header override.
 * Provides atomic cleanup for incomplete switches.
 */
async function clearSwitchState(): Promise<void> {
  if (Platform.OS === 'web' || !SecureStore) return;
  try {
    safeSetHeadersOverride(null);
    await SecureStore.deleteItemAsync(SWITCH_STATE_KEY);
  } catch {
    // Ignore cleanup errors
  }
}

type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

export interface FloatingButtonProps {
  onPress?: () => void;
  children?: React.ReactNode;
  position?: Position;
  size?: number;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

const getPositionStyle = (position: Position, offset: number, bottomInset: number): ViewStyle => {
  // Add extra offset for bottom positions to account for tab bar (~50px) + safe area
  const tabBarHeight = 50;
  const bottomOffset = offset + bottomInset + tabBarHeight;

  const styles: Record<Position, ViewStyle> = {
    'bottom-right': { bottom: bottomOffset, right: offset },
    'bottom-left': { bottom: bottomOffset, left: offset },
    'top-right': { top: offset, right: offset },
    'top-left': { top: offset, left: offset },
  };
  return styles[position];
};

export const AppifexFloatingButton: React.FC<FloatingButtonProps> = ({
  onPress,
  children,
  position = 'bottom-left',
  size = 40,
  backgroundColor = 'transparent',
  style,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const performSwitch = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Set switch state FIRST (before any other operations)
      // This enables recovery if app crashes during the switch
      await SecureStore!.setItemAsync(SWITCH_STATE_KEY, 'switching_to_sandbox');

      // 2. Read the sandbox channel that was stored when launching this target app
      // Falls back to 'development' in dev mode, 'production' in TestFlight builds
      const storedChannel = await SecureStore!.getItemAsync('appifex_sandbox_channel');
      const sandboxChannel = storedChannel || (__DEV__ ? 'development' : 'production');

      // 3. Read project ID and store initial route BEFORE any update operations
      // This ensures the write completes before reloadAsync() kills the process
      const projectId = await SecureStore!.getItemAsync(RETURN_PROJECT_ID_KEY);
      if (projectId) {
        await SecureStore!.setItemAsync(INITIAL_ROUTE_KEY, `/project/${projectId}`);
      }

      // 4. Small delay to ensure SecureStore writes are flushed to disk
      // before reloadAsync() terminates the process
      await new Promise(resolve => setTimeout(resolve, 200));

      // 5. Only override the channel header - URL is already configured in app.json
      safeSetHeadersOverride({ 'expo-channel-name': sandboxChannel });

      // Skip checkForUpdateAsync() - it doesn't work for cross-app switching
      // because it compares bundle hashes between different apps (meaningless)
      const result = await Updates.fetchUpdateAsync();
      if (result.isNew) {
        // Note: reloadAsync() terminates the process, so clearSwitchState()
        // will be called on sandbox app startup (in its _layout.tsx)
        await Updates.reloadAsync();
      } else {
        // No update available - clean up all state
        await clearSwitchState();
        if (projectId) {
          await SecureStore!.deleteItemAsync(INITIAL_ROUTE_KEY);
        }
        setIsLoading(false);
      }
    } catch (error) {
      // On error, clean up all state
      await clearSwitchState();
      try {
        await SecureStore!.deleteItemAsync(INITIAL_ROUTE_KEY);
      } catch {
        // Ignore cleanup errors
      }
      setIsLoading(false);
      Alert.alert('Error', `Error switching to Appifex: ${error}`);
    }
  }, []);

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    // Show confirmation dialog before switching
    Alert.alert(
      'Return to Appifex',
      'Are you sure you want to go back to the Appifex app?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: performSwitch },
      ]
    );
  };

  // Don't render in environments where channel switching doesn't work
  // - Web: SecureStore and expo-updates are not supported
  // - Expo Go: Channel switching requires a dev client or standalone build
  // - Production: Hide the button for TestFlight/App Store builds
  const isProduction = !__DEV__ && Updates.channel === 'production';
  if (Platform.OS === 'web' || isProduction || isExpoGo) {
    return null;
  }

  return (
    <>
      {/* Loading overlay */}
      <Modal visible={isLoading} transparent animationType="fade">
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </Modal>

      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={isLoading}
        style={[
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isLoading ? 'rgba(153, 153, 153, 0.8)' : backgroundColor,
          },
          getPositionStyle(position, 12, insets.bottom),
          style,
        ]}
      >
        {children || (
          <Image
            source={require('../assets/images/appifex-icon.png')}
            style={[styles.icon, { width: size, height: size, borderRadius: size / 2, opacity: 0.7 }]}
            resizeMode="cover"
          />
        )}
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    zIndex: 999,
    overflow: 'hidden',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    // Icon fills the button completely
  },
});

// Default export for compatibility with both import styles:
// import { AppifexFloatingButton } from '...' (named)
// import AppifexFloatingButton from '...' (default)
export default AppifexFloatingButton;
