// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const reactNative = require('eslint-plugin-react-native');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*'],
    plugins: {
      'react-native': reactNative,
    },
    rules: {
      // Catch text nodes directly in View (must be wrapped in <Text>)
      // This catches errors like: <View>📚</View> instead of <View><Text>📚</Text></View>
      'react-native/no-raw-text': 'error',
    },
  },
]);
