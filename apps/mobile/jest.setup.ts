import '@testing-library/jest-native/extend-expect';

jest.mock('@react-native/js-polyfills', () => ({}));
jest.mock('expo/build/winter', () => ({}));
jest.mock('expo/build/winter/index.js', () => ({}));
