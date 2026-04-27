// Minimal Metro configuration to bypass all Expo-related issues
const config = {
  transformer: {
    babelTransformerPath: require.resolve(__dirname, 'metro-react-native-babel-transformer'),
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
  maxWorkers: 4,
  resetCache: true,
};

module.exports = config;
