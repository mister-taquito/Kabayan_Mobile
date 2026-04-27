const { MetroConfig } = require('metro-config');

const config = {
  transformer: {
    getTransformOptions: () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    assetExts: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'],
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
  },
  watchFolders: ['node_modules'],
  server: {
    port: process.env.METRO_PORT || 8081,
  },
};

module.exports = config;
