import nextPlugin from "@next/eslint-plugin-next";

export default [
  nextPlugin.configs.recommended,
  {
    ignores: [".next/**", "node_modules/**", "out/**", "next-env.d.ts"],
  },
];
