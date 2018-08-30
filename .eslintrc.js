module.exports = {
  extends: ['airbnb-base', 'prettier'],
  plugins: ['jest'],
  env: {
    jest: true,
    es6: true,
    node: true,
  },
  rules: {
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    // sometimes you want to name a param that won't be used, for documentation
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-underscore-dangle': 'off',
    // we're cool with soft wrapping
    'max-len': 'off',
    'no-console': 'off',
    // this doesn't actually seem useful:
    'class-methods-use-this': 'off',
    'no-use-before-define': 0,
    'no-else-return': 0,
    'arrow-body-style': 0,
    'dot-notation': 0,
    'no-console': 0,
  },
};
