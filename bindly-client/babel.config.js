module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env.local',  
      }],
      'react-native-reanimated/plugin', // Must be the last plugin

    ],
  };
};
