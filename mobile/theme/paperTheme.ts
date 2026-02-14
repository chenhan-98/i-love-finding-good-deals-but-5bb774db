import { MD3LightTheme, type MD3Theme } from 'react-native-paper';

export const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 4,
  colors: {
    ...MD3LightTheme.colors,

    // Primary (green)
    primary: '#2E7D32',
    onPrimary: '#FFFFFF',
    primaryContainer: '#C8E6C9',
    onPrimaryContainer: '#0F3D13',

    // Secondary (muted green)
    secondary: '#4E6A50',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#D6E8D6',
    onSecondaryContainer: '#112913',

    // Tertiary (green-teal accent)
    tertiary: '#2F7D67',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#BFEBDD',
    onTertiaryContainer: '#002018',

    // Error
    error: '#B3261E',
    onError: '#FFFFFF',
    errorContainer: '#F9DEDC',
    onErrorContainer: '#410E0B',

    // Surfaces
    background: '#F7FBF6',
    onBackground: '#1A1C19',
    surface: '#FFFFFF',
    onSurface: '#1A1C19',
    surfaceVariant: '#DEE5DA',
    onSurfaceVariant: '#424940',
    surfaceDisabled: 'rgba(26, 28, 25, 0.12)',
    onSurfaceDisabled: 'rgba(26, 28, 25, 0.38)',

    // Borders
    outline: '#72796F',
    outlineVariant: '#C2C9BE',

    // Inverse (Snackbar, tooltips)
    inverseSurface: '#2F312D',
    inverseOnSurface: '#F0F1EC',
    inversePrimary: '#9AD69A',

    // Misc
    shadow: '#000000',
    scrim: '#000000',

    // Elevation tints (Paper uses these for elevated surfaces)
    elevation: {
      level0: 'transparent',
      level1: '#EFF8EE',
      level2: '#E7F3E5',
      level3: '#DFF0DE',
      level4: '#D7EBD6',
      level5: '#CEE6CD',
    },
  },
};
