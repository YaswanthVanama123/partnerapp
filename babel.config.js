module.exports = function (api) {
  api.cache(false); // Disable cache to ensure dotenv works correctly

  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
      }],
    ],
  };
};
