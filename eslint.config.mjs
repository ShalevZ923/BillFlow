import cwb from "eslint-config-next/core-web-vitals";
import ts from "eslint-config-next/typescript";

const config = [
  {
    ignores: [
      ".next/**",
      ".opencode/**",
      ".superpowers/**",
      ".worktrees/**",
      "node_modules/**",
      "next-env.d.ts",
      "test-results/**",
      "tsconfig.tsbuildinfo"
    ]
  },
  ...cwb,
  ...ts
];

export default config;
