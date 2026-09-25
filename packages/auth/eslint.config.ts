import { defineConfig } from "eslint/config";

import { baseConfig, restrictEnvAccess } from "@duo-snap/eslint-config/base";

export default defineConfig(
  {
    ignores: ["script/**"],
  },
  baseConfig,
  restrictEnvAccess,
);
