import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default [
  // 1. Global Ignores (must be its own object to apply globally in flat config)
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "pnpm-lock.yaml",
      "reports/**",
      ".stryker-tmp/**", // FIX: Ignore mutation testing sandboxes
      "**/*.d.ts", // FIX: Ignore type definition artifacts
      "**/*.js", // FIX: Ignore compiled JS artifacts
    ],
  },

  // 2. Base JS recommended rules
  js.configs.recommended,

  // 3. TypeScript source files (Type-Aware)
  {
    files: ["packages/*/src/**/*.ts"],
    ignores: ["**/*.test.ts", "**/*.spec.ts", "**/__tests__/**", "**/test-setup.ts"], // Exclude tests from strict type-aware parsing
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.es2022,
        ...globals.node,
        chrome: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs["recommended"].rules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-undef": "off", // FIX: Let TypeScript handle undefined variable checks naturally
    },
  },

  // 4. Test files (Non-Type-Aware, relaxed rules)
  {
    files: [
      "**/*.test.ts",
      "**/*.spec.ts",
      "**/test-setup.ts",
      "**/test-fixtures/**",
      "packages/*/tests/**/*.ts",
      "tests/**/*.ts",
    ],
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.node,
        chrome: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs["recommended"].rules,
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off", // Allow unused imports/vars in tests while drafting
      "no-console": "off",
      "no-undef": "off",
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },

  // 5. CLI-specific Overrides
  {
    files: ["packages/cli/src/**/*.ts"],
    rules: {
      "no-console": "off", // CLI needs console for user output
    },
  },
];
