module.exports = {
  presets: ['module:@react-native/babel-preset', 'nativewind/babel'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        alias: {
          '@app': './src/app',
          '@domain': './src/domain',
          '@application': './src/application',
          '@infrastructure': './src/infrastructure',
          '@presentation': './src/presentation',
          '@shared': './src/shared',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
