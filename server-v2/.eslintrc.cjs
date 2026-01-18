module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    // Forbid console.* globally to enforce proper logging
    "no-console": "error",

    // Existing rules maintained
    "prefer-const": "warn",
    "no-unused-vars": "warn",
  },
  overrides: [
    {
      // Allow console in test files for debugging
      files: ["**/*.test.ts", "**/*.test.js", "**/__tests__/**/*"],
      rules: {
        "no-console": "off",
        "@typescript-eslint/no-var-requires": "off",
      },
    },
    {
      // Allow require in config files that may need it
      files: ["*.config.js", "*.config.cjs"],
      parserOptions: {
        sourceType: "commonjs",
      },
      rules: {
        "@typescript-eslint/no-require-imports": "off",
        "@typescript-eslint/no-var-requires": "off",
      },
    },
    {
      // Handle JavaScript files in scripts directory with basic ESLint
      files: ["scripts/**/*.js"],
      parser: "espree",
      plugins: [],
      extends: ["eslint:recommended"],
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      rules: {
        "no-console": "off",
        "no-unused-vars": "warn",
      },
    },
    {
      // Handle other JavaScript files
      files: ["**/*.js"],
      parser: "espree",
      plugins: [],
      extends: ["eslint:recommended"],
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      rules: {
        "no-console": "off",
        "no-unused-vars": "warn",
      },
    },
  ],
};
