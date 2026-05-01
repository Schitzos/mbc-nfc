module.exports = {
  preset: '@react-native/jest-preset',
  collectCoverageFrom: [
    'src/application/**/*.ts',
    'src/domain/services/**/*.ts',
    'src/domain/errors/**/*.ts',
    'src/shared/utils/**/*.ts',
    '!src/**/__tests__/**',
    '!src/**/.gitkeep',
    '!src/**/*.d.ts',
    '!src/application/dto/card-summary-dto.ts',
    '!src/application/dto/check-nfc-availability-result-dto.ts',
    '!src/application/dto/role-action-result-dto.ts',
    '!src/application/dto/station-ledger-summary-dto.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'cobertura'],
  reporters: ['default'],
  coverageThreshold: {
    global: {
      statements: 90,
      lines: 90,
      functions: 90,
      branches: 80,
    },
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|nativewind|react-native-css-interop)/)',
  ],
};
