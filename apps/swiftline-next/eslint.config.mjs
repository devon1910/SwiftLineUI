import nextConfig from "eslint-config-next/core-web-vitals";
import nextTypescriptConfig from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextConfig,
  ...nextTypescriptConfig,
  {
    ignores: [".next/**", "coverage/**", "dist/**", "node_modules/**"],
  },
];

export default eslintConfig;
