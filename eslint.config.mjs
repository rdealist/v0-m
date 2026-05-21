import tseslint from "typescript-eslint"

export default [
  {
    ignores: [".next/**", "node_modules/**", "coverage/**"],
  },
  ...tseslint.config({
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {},
  }),
]
