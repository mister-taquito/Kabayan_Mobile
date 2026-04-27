const { getDefaultConfig } = require('@expo/metro-config');

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);
  
  return {
    ...defaultConfig,
    resolver: {
      ...defaultConfig.resolver,
    },
    transformer: {
      ...defaultConfig.transformer,
    },
    serializer: {
      ...defaultConfig.serializer,
    },
    server: {
      ...defaultConfig.server,
    },
  };
});
