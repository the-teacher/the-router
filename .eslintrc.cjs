module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  rules: {
    "prettier/prettier": "error",
    "@typescript-eslint/explicit-function-return-type": [
      "warn",
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      },
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  ignorePatterns: ["dist/", "node_modules/", "*.js"],
  overrides: [
    {
      files: ["**/*.test.ts", "**/tests/**/*.ts"],
      rules: {
        "@typescript-eslint/explicit-function-return-type": "off",
      },
    },
  ],
};
