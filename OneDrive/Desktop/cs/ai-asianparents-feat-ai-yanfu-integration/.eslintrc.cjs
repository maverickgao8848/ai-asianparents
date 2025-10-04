module.exports = {
  root: true,
  extends: ['./packages/config/eslint-base.cjs'],
  ignorePatterns: ['node_modules', 'dist', '.expo', '.next'],
  parserOptions: {
    tsconfigRootDir: __dirname
  }
};
