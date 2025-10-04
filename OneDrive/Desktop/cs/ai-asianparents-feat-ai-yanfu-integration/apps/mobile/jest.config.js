module.exports = {
  preset: 'jest-expo/universal',
  testMatch: ['<rootDir>/src/__tests__/**/*.test.ts?(x)', '<rootDir>/src/**/*.test.ts?(x)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(?:react-native|@react-native|react-native-.*|@react-native-.*|@react-navigation|expo(nent)?|expo-modules-.*|@expo/.*|@expo(nent)?|@unimodules|unimodules|sentry-expo|native-base|@ai-yanfu)/)'
  ],
  moduleNameMapper: {
    '^@ai-yanfu/config$': '<rootDir>/../../packages/config/index.ts',
    '^@react-native/js-polyfills$': '<rootDir>/__mocks__/@react-native/js-polyfills.js',
    '^@react-native/js-polyfills/(.*)$': '<rootDir>/__mocks__/@react-native/js-polyfills.js',
    '^expo/build/winter/.*$': '<rootDir>/__mocks__/expo-winter.js'
  }
};
