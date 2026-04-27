const { getDefaultConfig } = require('@expo/metro-config');

// Create a completely custom config to bypass Expo's problematic defaults
const config = {
  transformer: {
    babelTransformerPath: require.resolve(__dirname, 'metro-react-native-babel-transformer'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    assetExts: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'],
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
    platforms: ['ios', 'android'],
  },
  watchFolders: ['node_modules'],
  server: {
    port: process.env.METRO_PORT || 8081,
  },
  // Override any problematic Expo defaults
  maxWorkers: 4,
  resetCache: true,
};

module.exports = config;
