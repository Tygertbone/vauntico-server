# Developer Extension Guardrails

This document outlines the recommended VS Code extensions for contributors to this repository. These extensions ensure consistent linting, formatting, and development practices across the team.

## Recommended Extensions

### 1. ESLint

- **Purpose**: Linting for JavaScript and TypeScript. Ensures code quality and adherence to best practices.
- **Installation**: Search for `ESLint` in the VS Code Marketplace and install it.

### 2. Prettier – Code Formatter

- **Purpose**: Code formatting. Automatically formats code to ensure consistency.
- **Installation**: Search for `Prettier – Code Formatter` in the VS Code Marketplace and install it.

### 3. Error Lens

- **Purpose**: Enhances error visibility by displaying errors directly in the code editor.
- **Installation**: Search for `Error Lens` in the VS Code Marketplace and install it.

### 4. GitLens

- **Purpose**: Git integration. Provides enhanced Git capabilities such as blame annotations, repository visualization, and more.
- **Installation**: Search for `GitLens` in the VS Code Marketplace and install it.

### 5. YAML Language Support by Red Hat

- **Purpose**: YAML validation and support. Ensures YAML files are correctly formatted and validated.
- **Installation**: Search for `YAML Language Support by Red Hat` in the VS Code Marketplace and install it.

### 6. GitHub Actions

- **Purpose**: CI/CD validation. Provides support for GitHub Actions workflows.
- **Installation**: Search for `GitHub Actions` in the VS Code Marketplace and install it.

### 7. Thunder Client or REST Client

- **Purpose**: API testing. Allows testing and debugging of APIs directly from VS Code.
- **Installation**: Search for `Thunder Client` or `REST Client` in the VS Code Marketplace and install your preferred choice.

## Installation Instructions

1. Open VS Code.
2. Navigate to the Extensions view by clicking the Extensions icon in the Activity Bar on the side of the window or pressing `Ctrl+Shift+X`.
3. Search for the extension by name.
4. Click the `Install` button for each extension.

## Configuration

Ensure that the following settings are applied in your VS Code workspace to maintain consistency:

- **Prettier as Default Formatter**: Set Prettier as the default formatter for supported languages.
- **ESLint Validation**: Enable ESLint validation for TypeScript and JavaScript files.
- **Auto-Update Disabled**: Extensions are configured to not auto-update to prevent drift.

For more details, refer to the `.vscode/settings.json` file in this repository.

## Enforced Settings

The following settings are enforced via `.vscode/settings.json`:

```json
{
  "extensions.autoUpdate": false,
  "extensions.autoCheckUpdates": false,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "eslint.validate": ["typescript", "javascript"]
}
```

## Validation Results

- **ESLint**: Active and configured for TypeScript and JavaScript.
- **Prettier**: Active and set as the default formatter.
- **Linting**: 620 problems detected (367 errors, 253 warnings) across the codebase.
- **Formatting**: Prettier formatting checks completed with warnings in multiple files.

## Recommendations

1. Address the linting errors and warnings to ensure code quality.
2. Run `npx eslint --fix` to automatically fix some of the linting issues.
3. Run `npx prettier --write` to automatically format files according to Prettier rules.
