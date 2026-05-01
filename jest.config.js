module.exports = {
  preset: '@react-native/jest-preset',
  collectCoverageFrom: [
    'App.tsx',
    'src/**/*.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/.gitkeep',
    '!src/**/*.d.ts',
    '!src/application/dto/card-summary-dto.ts',
    '!src/application/dto/check-nfc-availability-result-dto.ts',
    '!src/application/dto/role-action-result-dto.ts',
    '!src/application/dto/station-ledger-summary-dto.ts',
    '!src/domain/entities/mbc-card.ts',
    '!src/domain/repositories/local-ledger-repository.ts',
    '!src/domain/repositories/mbc-card-repository.ts',
    '!src/shared/types/**',
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
