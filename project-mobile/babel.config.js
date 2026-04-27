// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Temporarily disabled react-native-reanimated/plugin
      // [
      //   'react-native-reanimated/plugin',
      //   {
      //     relativeSourceLocation: true,
      //   },
      // ],
    ],
  };
};
