// ESLint configuration for homepage-redesign directory
// Extends root config but adds Node.js environment for Next.js config files

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2020: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  globals: {
    ...require("globals").browser,
    ...require("globals").node,
  },
  rules: {
    "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
  },
  overrides: [
    {
      files: ["next.config.js"],
      rules: {
        "no-unused-vars": "off",
      },
    },
  ],
};
