import { defineConfig } from "eslint/config";

import { baseConfig, restrictEnvAccess } from "@duo-snap/eslint-config/base";
import { nextjsConfig } from "@duo-snap/eslint-config/nextjs";
import { reactConfig } from "@duo-snap/eslint-config/react";

export default defineConfig(
  {
    ignores: [".next/**"],
  },
  baseConfig,
  reactConfig,
  nextjsConfig,
  restrictEnvAccess,
);
