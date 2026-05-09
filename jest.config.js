module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    'react-native-linear-gradient':
      '<rootDir>/__mocks__/react-native-linear-gradient.js',
    'react-native-vector-icons/(.*)':
      '<rootDir>/__mocks__/react-native-vector-icons.js',
    '@react-navigation/native':
      '<rootDir>/__mocks__/@react-navigation/native.js',
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@presentation/(.*)$': '<rootDir>/src/presentation/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },
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
      lines: 99,
      functions: 96,
      branches: 99,
    },
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|nativewind|react-native-css-interop|react-native-vector-icons|react-native-linear-gradient)/)',
  ],
};
