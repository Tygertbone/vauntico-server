module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
  },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  plugins: ["@typescript-eslint"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
    project: "./tsconfig.json",
  },
  rules: {
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-console": "warn",
    "@typescript-eslint/prefer-const": "error",
    "no-unused-vars": "off",
    "no-console": "off",
    "no-useless-escape": "warn",
    "no-extra-semi": "error",
    "no-prototype-builtins": "error",
    "no-case-declarations": "error",
  },
};
