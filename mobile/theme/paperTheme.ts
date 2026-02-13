import { MD3LightTheme, type MD3Theme } from 'react-native-paper';

export const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 4,
  colors: {
    ...MD3LightTheme.colors,

    // Primary
    primary: '#DB2777',
    onPrimary: '#FFFFFF',
    primaryContainer: '#FCE7F3',
    onPrimaryContainer: '#831843',

    // Secondary
    secondary: '#EC4899',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#FBCFE8',
    onSecondaryContainer: '#9D174D',

    // Tertiary
    tertiary: '#F472B6',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#F9A8D4',
    onTertiaryContainer: '#831843',

    // Error
    error: '#DC2626',
    onError: '#FFFFFF',
    errorContainer: '#FEE2E2',
    onErrorContainer: '#991B1B',

    // Surfaces
    background: '#FFF7FB',
    onBackground: '#3B0A26',
    surface: '#FFFFFF',
    onSurface: '#3B0A26',
    surfaceVariant: '#FCE7F3',
    onSurfaceVariant: '#6B214C',
    surfaceDisabled: 'rgba(59, 10, 38, 0.12)',
    onSurfaceDisabled: 'rgba(59, 10, 38, 0.38)',

    // Borders
    outline: '#F9A8D4',
    outlineVariant: '#FBCFE8',

    // Inverse (Snackbar, tooltips)
    inverseSurface: '#4A1232',
    inverseOnSurface: '#FFF1F7',
    inversePrimary: '#F9A8D4',

    // Misc
    shadow: '#000000',
    scrim: '#000000',

    // Elevation tints (Paper uses these for elevated surfaces)
    elevation: {
      level0: 'transparent',
      level1: '#FFF1F7',
      level2: '#FCE7F3',
      level3: '#FBCFE8',
      level4: '#F9A8D4',
      level5: '#F472B6',
    },
  },
};
