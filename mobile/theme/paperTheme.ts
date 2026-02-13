import { MD3LightTheme, type MD3Theme } from 'react-native-paper';

export const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 4,
  colors: {
    ...MD3LightTheme.colors,

    // Primary (orange-led brand)
    primary: '#F97316',
    onPrimary: '#FFFFFF',
    primaryContainer: '#FFE2CC',
    onPrimaryContainer: '#7A2E00',

    // Secondary
    secondary: '#B45309',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#FFE9D6',
    onSecondaryContainer: '#7C2D12',

    // Tertiary
    tertiary: '#C2410C',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#FFE8D8',
    onTertiaryContainer: '#7C2D12',

    // Error
    error: '#B00020',
    onError: '#FFFFFF',
    errorContainer: '#F9DEDC',
    onErrorContainer: '#410E0B',

    // Surfaces
    background: '#FFF9F5',
    onBackground: '#2A1B12',
    surface: '#FFFFFF',
    onSurface: '#2A1B12',
    surfaceVariant: '#F6E7DD',
    onSurfaceVariant: '#6A5142',
    surfaceDisabled: 'rgba(42, 27, 18, 0.12)',
    onSurfaceDisabled: 'rgba(42, 27, 18, 0.38)',

    // Borders
    outline: '#D8B8A3',
    outlineVariant: '#EED9CB',

    // Inverse (Snackbar, tooltips)
    inverseSurface: '#3A2518',
    inverseOnSurface: '#FFF8F3',
    inversePrimary: '#FFB47F',

    // Misc
    shadow: '#000000',
    scrim: '#000000',

    // Elevation tints (Paper uses these for elevated surfaces)
    elevation: {
      level0: 'transparent',
      level1: '#FFF4EC',
      level2: '#FFECDD',
      level3: '#FFE4CE',
      level4: '#FFDCBF',
      level5: '#FFD3AF',
    },
  },
};
