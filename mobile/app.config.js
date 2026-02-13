import appJson from './app.json';

/**
 * Dynamic Expo configuration with environment variable support.
 *
 * Environment Variables (all optional):
 *   - EXPO_OWNER: Expo account/organization name
 *   - EAS_PROJECT_ID: EAS project ID (from eas init)
 *   - IOS_BUNDLE_IDENTIFIER: iOS bundle identifier
 *   - ANDROID_PACKAGE: Android package name
 *   - EXPO_PUBLIC_API_URL: Backend API base URL for generated apps
 *   - EXPO_PUBLIC_NEON_AUTH_URL: Neon Auth base URL for generated apps
 *   - EXPO_PUBLIC_UPDATES_URL: Full custom updates manifest URL override (preferred)
 *   - CUSTOM_EXPO_UPDATE_BASE_URL: Base URL to build /api/v1/expo-updates/update
 *     (resolved at Expo config evaluation time: build/start)
 *   - EXPO_TOKEN: Expo access token (for authentication)
 *
 * Use Cases:
 *   1. Developer Testing: Set your own Expo account to test locally
 *   2. Staging Environment: Use different Expo project than production
 *   3. Multi-Environment Deployments: Different configs per environment
 *
 * Defaults (when env vars not set):
 *   - Uses values from app.json (production Appifex account)
 */
export default () => {
  // Read environment variables (fallback to app.json if not set)
  const owner = process.env.EXPO_OWNER || appJson.expo.owner;
  const easProjectId = process.env.EAS_PROJECT_ID || appJson.expo.extra?.eas?.projectId;
  const bundleId = process.env.IOS_BUNDLE_IDENTIFIER || appJson.expo.ios?.bundleIdentifier;
  const androidPackage = process.env.ANDROID_PACKAGE || appJson.expo.android?.package;
  const apiUrl =
    process.env.EXPO_PUBLIC_API_URL || appJson.expo.extra?.apiUrl || null;
  const neonAuthUrl =
    process.env.EXPO_PUBLIC_NEON_AUTH_URL ||
    appJson.expo.extra?.neonAuthUrl ||
    null;
  const updateBaseUrl =
    process.env.CUSTOM_EXPO_UPDATE_BASE_URL || appJson.expo.extra?.updatesBaseUrl || null;
  // EXPO_PUBLIC_UPDATES_URL is the primary override. CUSTOM_EXPO_UPDATE_BASE_URL is
  // only used to derive the final manifest URL when full URL override is not provided.
  const updatesUrl =
    process.env.EXPO_PUBLIC_UPDATES_URL ||
    (updateBaseUrl ? `${updateBaseUrl.replace(/\/$/, '')}/api/v1/expo-updates/update` : null) ||
    appJson.expo.updates?.url;

  // Log when using custom configuration
  if (process.env.EXPO_OWNER || process.env.EAS_PROJECT_ID) {
    console.log('🔧 Using environment-based configuration:');
    if (process.env.EXPO_OWNER) {
      console.log(`   Owner: ${owner}`);
    }
    if (process.env.EAS_PROJECT_ID) {
      console.log(`   Project ID: ${easProjectId}`);
    }
  }

  return {
    ...appJson.expo,

    // Override with environment variables if set
    owner: owner,

    ios: {
      ...appJson.expo.ios,
      bundleIdentifier: bundleId,
    },

    android: {
      ...appJson.expo.android,
      package: androidPackage,
    },

    extra: {
      ...appJson.expo.extra,
      eas: {
        projectId: easProjectId
      },
      ...(apiUrl ? { apiUrl } : {}),
      ...(neonAuthUrl ? { neonAuthUrl } : {}),
    },

    updates: {
      ...appJson.expo.updates,
      url: updatesUrl,
    }
  };
};
