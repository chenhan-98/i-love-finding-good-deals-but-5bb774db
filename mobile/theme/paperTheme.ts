import { MD3LightTheme, type MD3Theme } from 'react-native-paper';

export const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 4,
  colors: {
    ...MD3LightTheme.colors,

    // Primary
    primary: '#2563EB',
    onPrimary: '#FFFFFF',
    primaryContainer: '#DBEAFE',
    onPrimaryContainer: '#1E3A5F',

    // Secondary
    secondary: '#0F766E',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#CCFBF1',
    onSecondaryContainer: '#134E4A',

    // Tertiary (uses secondary tones by default)
    tertiary: '#7C3AED',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#EDE9FE',
    onTertiaryContainer: '#4C1D95',

    // Error
    error: '#DC2626',
    onError: '#FFFFFF',
    errorContainer: '#FEE2E2',
    onErrorContainer: '#991B1B',

    // Surfaces
    background: '#F8FAFC',
    onBackground: '#0F172A',
    surface: '#FFFFFF',
    onSurface: '#0F172A',
    surfaceVariant: '#E2E8F0',
    onSurfaceVariant: '#475569',
    surfaceDisabled: 'rgba(15, 23, 42, 0.12)',
    onSurfaceDisabled: 'rgba(15, 23, 42, 0.38)',

    // Borders
    outline: '#CBD5E1',
    outlineVariant: '#E2E8F0',

    // Inverse (Snackbar, tooltips)
    inverseSurface: '#1E293B',
    inverseOnSurface: '#F1F5F9',
    inversePrimary: '#93C5FD',

    // Misc
    shadow: '#000000',
    scrim: '#000000',

    // Elevation tints (Paper uses these for elevated surfaces)
    elevation: {
      level0: 'transparent',
      level1: '#F8FAFC',
      level2: '#F1F5F9',
      level3: '#E2E8F0',
      level4: '#CBD5E1',
      level5: '#94A3B8',
    },
  },
};
