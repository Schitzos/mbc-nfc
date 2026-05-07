module.exports = {
  preset: '@react-native/jest-preset',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!App.tsx',
    '!src/**/__tests__/**',
    '!src/**/.gitkeep',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'cobertura'],
  reporters: ['default'],
  coverageThreshold: {
    global: {
      statements: 99,
      lines: 100,
      functions: 96,
      branches: 99,
    },
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|nativewind|react-native-css-interop)/)',
  ],
};
