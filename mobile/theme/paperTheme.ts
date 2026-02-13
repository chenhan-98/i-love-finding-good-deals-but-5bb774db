import { MD3LightTheme, type MD3Theme } from 'react-native-paper';

export const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 4,
  colors: {
    ...MD3LightTheme.colors,

    // Primary
    primary: '#111111',
    onPrimary: '#FFFFFF',
    primaryContainer: '#E7E7E7',
    onPrimaryContainer: '#111111',

    // Secondary
    secondary: '#2B2B2B',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#F1F1F1',
    onSecondaryContainer: '#1A1A1A',

    // Tertiary
    tertiary: '#4A4A4A',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#EFEFEF',
    onTertiaryContainer: '#1A1A1A',

    // Error (kept in monochrome palette)
    error: '#1F1F1F',
    onError: '#FFFFFF',
    errorContainer: '#EAEAEA',
    onErrorContainer: '#111111',

    // Surfaces
    background: '#FFFFFF',
    onBackground: '#111111',
    surface: '#FFFFFF',
    onSurface: '#111111',
    surfaceVariant: '#F3F3F3',
    onSurfaceVariant: '#4D4D4D',
    surfaceDisabled: 'rgba(17, 17, 17, 0.12)',
    onSurfaceDisabled: 'rgba(17, 17, 17, 0.38)',

    // Borders
    outline: '#D1D1D1',
    outlineVariant: '#E5E5E5',

    // Inverse (Snackbar, tooltips)
    inverseSurface: '#111111',
    inverseOnSurface: '#FAFAFA',
    inversePrimary: '#E0E0E0',

    // Misc
    shadow: '#000000',
    scrim: '#000000',

    // Elevation tints (Paper uses these for elevated surfaces)
    elevation: {
      level0: 'transparent',
      level1: '#FCFCFC',
      level2: '#F7F7F7',
      level3: '#F0F0F0',
      level4: '#EAEAEA',
      level5: '#E3E3E3',
    },
  },
};
