import { defineConfig } from "eslint/config";

import { baseConfig } from "@duo-snap/eslint-config/base";

export default defineConfig(
  {
    ignores: ["dist/**"],
  },
  baseConfig,
);
