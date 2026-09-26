import { createClient } from "@supabase/supabase-js";

export const SNAP_BUCKET = "duo-snaps";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
};

type SupabaseConfig = {
  url?: string;
  anonKey?: string;
  serviceRoleKey?: string;
};

export class MissingSupabaseConfigError extends Error {
  constructor(message = "Supabase credentials are not configured.") {
    super(message);
    this.name = "MissingSupabaseConfigError";
  }
}

export function getAllowedEmails(source = process.env.ALLOWED_EMAILS) {
  return new Set(
    (source ?? "")
      .split(",")
      .map((email: string) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAllowedEmail(email: string | null | undefined) {
  if (!email) return false;

  const allowedEmails = getAllowedEmails();

  return allowedEmails.size > 0 && allowedEmails.has(email.toLowerCase());
}

export function readSupabaseConfig(): SupabaseConfig {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export function assertSupabaseClientConfig(config = readSupabaseConfig()) {
  if (!config.url || !config.anonKey) {
    throw new MissingSupabaseConfigError(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return {
    url: config.url,
    anonKey: config.anonKey,
  };
}

export function assertSupabaseAdminConfig(config = readSupabaseConfig()) {
  if (!config.url || !config.serviceRoleKey) {
    throw new MissingSupabaseConfigError(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return {
    url: config.url,
    serviceRoleKey: config.serviceRoleKey,
  };
}

export function createSupabaseBrowserClient(
  url: string | undefined,
  anonKey: string | undefined,
) {
  if (!url || !anonKey) return null;

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });
}

export function createSupabaseServerClient() {
  const config = assertSupabaseClientConfig();

  return createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createSupabaseAdminClient() {
  const config = assertSupabaseAdminConfig();

  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getBearerToken(headers: Headers) {
  const authorization = headers.get("authorization");

  if (!authorization?.toLowerCase().startsWith("bearer ")) return null;

  return authorization.slice("bearer ".length).trim();
}

export async function getAuthUser(headers: Headers): Promise<AuthUser | null> {
  const token = getBearerToken(headers);

  if (!token) return null;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user?.email) return null;

  if (!isAllowedEmail(data.user.email)) return null;

  return {
    id: data.user.id,
    email: data.user.email,
    displayName:
      typeof data.user.user_metadata.name === "string"
        ? data.user.user_metadata.name
        : null,
    avatarUrl:
      typeof data.user.user_metadata.avatar_url === "string"
        ? data.user.user_metadata.avatar_url
        : null,
  };
}

export function getConfigStatus() {
  const config = readSupabaseConfig();

  return {
    hasSupabaseUrl: Boolean(config.url),
    hasSupabaseAnonKey: Boolean(config.anonKey),
    hasSupabaseServiceRoleKey: Boolean(config.serviceRoleKey),
    allowedEmailCount: getAllowedEmails().size,
  };
}
