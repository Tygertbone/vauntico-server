import js from "@eslint/js";
import react from "eslint-plugin-react";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-plugin-prettier";
import next from "@next/eslint-plugin-next";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react,
      "jsx-a11y": jsxA11y,
      prettier,
      "@next/next": next,
    },
    rules: {
      "react/react-in-jsx-scope": "off", // Next.js does not require React in scope
      "react/prop-types": "off", // Disable prop-types as we use TypeScript
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
    ignores: [".next/**"], // Exclude Next.js build files from linting
  },
];
