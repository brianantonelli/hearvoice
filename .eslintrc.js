module.exports = {
  env: {
    browser: false,
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest',
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
    },
  },
  ignorePatterns: ['RelationshipCache.js'],
  rules: {},
};
