import "react-native-url-polyfill/auto";

import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

export const EXPO_PUBLIC_SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  Constants.expoConfig?.extra?.supabaseUrl ??
  "";
export const EXPO_PUBLIC_SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  Constants.expoConfig?.extra?.supabaseAnonKey ??
  "";

const SecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

export const supabase =
  EXPO_PUBLIC_SUPABASE_URL && EXPO_PUBLIC_SUPABASE_ANON_KEY
    ? createClient(EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, {
        auth: {
          storage: SecureStoreAdapter,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;

