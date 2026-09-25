import { defineConfig } from "eslint/config";

import { baseConfig } from "@duo-snap/eslint-config/base";
import { reactConfig } from "@duo-snap/eslint-config/react";

export default defineConfig(
  {
    ignores: [".expo/**", "expo-plugins/**"],
  },
  baseConfig,
  reactConfig,
);
