var path = require('path');

module.exports = {
  env: {
    node: true,
  },
  rules: {
    'no-console': 'off'
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module"
  },
  parser: "babel-eslint",
  globals: {
    $: false,
    module: false,
    Ember: false,
    process: false
  }
};
