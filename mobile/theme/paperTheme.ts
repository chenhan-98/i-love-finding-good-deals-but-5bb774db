import { MD3LightTheme, type MD3Theme } from 'react-native-paper';

export const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 4,
  colors: {
    ...MD3LightTheme.colors,

    // Primary
    primary: '#1D4ED8',
    onPrimary: '#FFFFFF',
    primaryContainer: '#DBEAFE',
    onPrimaryContainer: '#1E3A8A',

    // Secondary
    secondary: '#2563EB',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#DBEAFE',
    onSecondaryContainer: '#1E40AF',

    // Tertiary
    tertiary: '#3B82F6',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#BFDBFE',
    onTertiaryContainer: '#1E3A8A',

    // Error
    error: '#DC2626',
    onError: '#FFFFFF',
    errorContainer: '#FEE2E2',
    onErrorContainer: '#991B1B',

    // Surfaces
    background: '#F8FAFF',
    onBackground: '#0F172A',
    surface: '#FFFFFF',
    onSurface: '#0F172A',
    surfaceVariant: '#DBEAFE',
    onSurfaceVariant: '#334155',
    surfaceDisabled: 'rgba(15, 23, 42, 0.12)',
    onSurfaceDisabled: 'rgba(15, 23, 42, 0.38)',

    // Borders
    outline: '#93C5FD',
    outlineVariant: '#BFDBFE',

    // Inverse (Snackbar, tooltips)
    inverseSurface: '#1E293B',
    inverseOnSurface: '#F8FAFC',
    inversePrimary: '#93C5FD',

    // Misc
    shadow: '#000000',
    scrim: '#000000',

    // Elevation tints (Paper uses these for elevated surfaces)
    elevation: {
      level0: 'transparent',
      level1: '#EFF6FF',
      level2: '#DBEAFE',
      level3: '#BFDBFE',
      level4: '#93C5FD',
      level5: '#60A5FA',
    },
  },
};
