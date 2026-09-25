import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Duo Snap",
  slug: "duo-snap",
  scheme: "duosnap",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon-light.png",
  userInterfaceStyle: "automatic",
  updates: {
    fallbackToCacheTimeout: 0,
  },
  newArchEnabled: true,
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: "com.kanenguyen.duosnap",
    supportsTablet: true,
    icon: {
      light: "./assets/icon-light.png",
      dark: "./assets/icon-dark.png",
    },
  },
  android: {
    package: "com.kanenguyen.duosnap",
    adaptiveIcon: {
      foregroundImage: "./assets/icon-light.png",
      backgroundColor: "#180914",
    },
    edgeToEdgeEnabled: true,
  },
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-web-browser",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#180914",
        image: "./assets/icon-light.png",
        dark: {
          backgroundColor: "#180914",
          image: "./assets/icon-dark.png",
        },
      },
    ],
    [
      "expo-camera",
      {
        cameraPermission: "Duo Snap needs access to your camera to capture and share moments.",
      },
    ],
  ],
});

