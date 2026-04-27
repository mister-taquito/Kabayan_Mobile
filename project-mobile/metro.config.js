const { getDefaultConfig } = require('@expo/metro-config');

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);
  
  return {
    ...defaultConfig,
    resolver: {
      ...defaultConfig.resolver,
      // Add any custom resolver config here if needed
    },
    transformer: {
      ...defaultConfig.transformer,
      // Ensure babelTransformerPath is properly set
      babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
    },
    serializer: {
      ...defaultConfig.serializer,
    },
    server: {
      ...defaultConfig.server,
    },
  };
});
