module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  parserOptions: {
    ecmaVersion: 2021,
  },
  rules: {
    "no-restricted-globals": "off",
    "prefer-arrow-callback": "off",
    "quotes": ["error", "double"],
    globals: {
      require: "readonly",
      module: "readonly",
      exports: "readonly",
    },
  },
};