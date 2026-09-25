"use client";

import type { Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  Heart,
  ImagePlus,
  Loader2,
  LockKeyhole,
  LogOut,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SNAP_BUCKET } from "@duo-snap/auth";
import { Badge } from "@duo-snap/ui/badge";
import { Button } from "@duo-snap/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@duo-snap/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@duo-snap/ui/dialog";
import { Input } from "@duo-snap/ui/input";
import { Textarea } from "@duo-snap/ui/textarea";
import { toast } from "@duo-snap/ui/toast";

import { useTRPC } from "~/trpc/react";
import { getSupabaseBrowserClient } from "~/utils/supabase";

type FeedPhoto = {
  id: string;
  caption: string | null;
  createdAt: Date;
  imagePath: string;
  imageUrl: string | null;
  author: {
    id: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
};

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function DuoSnapApp() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [caption, setCaption] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<FeedPhoto | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const statusQuery = useQuery(trpc.auth.status.queryOptions());

  const photosQuery = useQuery(
    trpc.photos.list.queryOptions(undefined, {
      enabled: Boolean(session),
      retry: false,
    }),
  );

  const uploadUrlMutation = useMutation(
    trpc.photos.createUploadUrl.mutationOptions(),
  );

  const createPhotoMutation = useMutation(
    trpc.photos.create.mutationOptions({
      async onSuccess() {
        setCaption("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        await queryClient.invalidateQueries(trpc.photos.list.queryFilter());
      },
    }),
  );

  const config = statusQuery.data;
  const isConfigured =
    Boolean(supabase) &&
    Boolean(config?.hasSupabaseUrl) &&
    Boolean(config?.hasSupabaseAnonKey) &&
    Boolean(config?.hasSupabaseServiceRoleKey) &&
    Boolean(config?.allowedEmailCount);

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      void queryClient.invalidateQueries();
    });

    return () => subscription.unsubscribe();
  }, [queryClient, supabase]);

  const userEmail = session?.user.email ?? null;

  const heroStats = useMemo(
    () => [
      ["Private users", "2"],
      ["Storage bucket", SNAP_BUCKET],
      ["Shared API", "tRPC"],
    ],
    [],
  );

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      toast.error("Supabase is not configured yet.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;

    const allowlist = await queryClient.fetchQuery(
      trpc.auth.canRequestSignIn.queryOptions({ email: normalizedEmail }),
    );

    if (!allowlist.allowed) {
      toast.error(allowlist.message);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Magic link sent. Check your inbox.");
  }

  async function handleSignOut() {
    if (!supabase) return;

    await supabase.auth.signOut();
    setSession(null);
    await queryClient.invalidateQueries();
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      toast.error("Supabase is not configured yet.");
      return;
    }

    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      toast.error("Choose or capture a photo first.");
      return;
    }

    const contentType = file.type || "image/jpeg";

    try {
      const upload = await uploadUrlMutation.mutateAsync({
        fileName: file.name || "duo-snap.jpg",
        contentType,
      });

      const { error: uploadError } = await supabase.storage
        .from(SNAP_BUCKET)
        .uploadToSignedUrl(upload.path, upload.token, file);

      if (uploadError) throw uploadError;

      await createPhotoMutation.mutateAsync({
        imagePath: upload.path,
        caption,
      });

      toast.success("Snap shared with your duo.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not upload the photo. Check Supabase setup.",
      );
    }
  }

  const uploading =
    uploadUrlMutation.isPending || createPhotoMutation.isPending;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,77,141,0.24),_transparent_34%),linear-gradient(135deg,_#fff7fb_0%,_#fff_45%,_#f8fbff_100%)] px-4 py-6 dark:bg-[radial-gradient(circle_at_top_left,_rgba(255,77,141,0.18),_transparent_34%),linear-gradient(135deg,_#180914_0%,_#0b0b12_50%,_#101827_100%)]">
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-primary/15 to-transparent blur-3xl" />

      <section className="relative mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex min-h-[calc(100vh-3rem)] flex-col justify-between rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-2xl shadow-pink-500/10 backdrop-blur dark:border-white/10 dark:bg-white/5"
        >
          <div className="space-y-8">
            <Badge variant="success" className="gap-2">
              <LockKeyhole className="size-3" />
              Private couple snap app
            </Badge>

            <div className="space-y-5">
              <h1 className="max-w-xl text-5xl font-black tracking-tight text-balance sm:text-7xl">
                Duo Snap keeps two people in the moment.
              </h1>
              <p className="text-muted-foreground max-w-xl text-lg">
                A Locket-inspired fullstack app with shared backend types,
                Supabase Auth, signed Storage uploads, and separate polished web
                and mobile interfaces.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {heroStats.map(([label, value]) => (
                <Card
                  key={label}
                  className="border-white/70 bg-white/70 py-4 dark:border-white/10 dark:bg-white/5"
                >
                  <CardContent className="space-y-1 px-4">
                    <p className="text-2xl font-black">{value}</p>
                    <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                      {label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="mt-8 border-white/70 bg-white/80 dark:border-white/10 dark:bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                Setup status
              </CardTitle>
              <CardDescription>
                The app renders without secrets. Add .env values to unlock
                auth, database, and storage.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <StatusLine ok={Boolean(config?.hasSupabaseUrl)} label="Supabase URL" />
              <StatusLine ok={Boolean(config?.hasSupabaseAnonKey)} label="Anon key" />
              <StatusLine ok={Boolean(config?.hasSupabaseServiceRoleKey)} label="Server service role for signed uploads" />
              <StatusLine ok={Boolean(config?.allowedEmailCount)} label="ALLOWED_EMAILS allowlist" />
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-6">
          <Card className="border-white/70 bg-white/85 shadow-xl shadow-pink-500/10 backdrop-blur dark:border-white/10 dark:bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Heart className="size-6 fill-primary text-primary" />
                {userEmail ? "Shared feed" : "Sign in to your private duo"}
              </CardTitle>
              <CardDescription>
                {userEmail
                  ? "Signed in as " + userEmail
                  : "Only the two emails configured in ALLOWED_EMAILS can use this app."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!authReady ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Checking session...
                </div>
              ) : session ? (
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="success">Authenticated</Badge>
                  <Button variant="outline" onClick={handleSignOut}>
                    <LogOut className="size-4" />
                    Sign out
                  </Button>
                </div>
              ) : (
                <form className="grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={handleLogin}>
                  <Input
                    type="email"
                    placeholder="person1@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={!supabase}
                  />
                  <Button type="submit" disabled={!supabase || statusQuery.isLoading}>
                    Send magic link
                  </Button>
                  {!isConfigured && (
                    <p className="text-muted-foreground sm:col-span-2 text-sm">
                      Configure Supabase credentials and the two allowed emails
                      before requesting real magic links.
                    </p>
                  )}
                </form>
              )}
            </CardContent>
          </Card>

          <AnimatePresence>
            {session && (
              <motion.form
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                onSubmit={handleUpload}
              >
                <Card className="border-white/70 bg-white/85 shadow-xl shadow-pink-500/10 backdrop-blur dark:border-white/10 dark:bg-white/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="size-5 text-primary" />
                      Capture a snap
                    </CardTitle>
                    <CardDescription>
                      Browser capture uses a mobile-friendly file input with
                      capture set to environment.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                    />
                    <Textarea
                      value={caption}
                      maxLength={160}
                      placeholder="Caption, mood, or tiny note..."
                      onChange={(event) => setCaption(event.target.value)}
                    />
                    <Button type="submit" disabled={uploading}>
                      {uploading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <UploadCloud className="size-4" />
                      )}
                      Share snap
                    </Button>
                  </CardContent>
                </Card>
              </motion.form>
            )}
          </AnimatePresence>

          <section className="grid gap-4">
            {session && photosQuery.isLoading && <FeedSkeleton />}

            {session && photosQuery.error && (
              <Card className="border-destructive/30 bg-destructive/5">
                <CardHeader>
                  <CardTitle>Feed unavailable</CardTitle>
                  <CardDescription>{photosQuery.error.message}</CardDescription>
                </CardHeader>
              </Card>
            )}

            {session && photosQuery.data?.length === 0 && (
              <Card className="border-dashed bg-white/70 py-10 text-center dark:bg-white/5">
                <CardContent className="space-y-3">
                  <ImagePlus className="mx-auto size-10 text-primary" />
                  <p className="text-lg font-semibold">No snaps yet</p>
                  <p className="text-muted-foreground text-sm">
                    Upload the first photo and it will appear here.
                  </p>
                </CardContent>
              </Card>
            )}

            <AnimatePresence mode="popLayout">
              {photosQuery.data?.map((photo, index) => (
                <motion.button
                  type="button"
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => setSelectedPhoto(photo)}
                  className="group text-left"
                >
                  <Card className="overflow-hidden border-white/70 bg-white/85 p-0 shadow-xl shadow-pink-500/10 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl dark:border-white/10 dark:bg-white/5">
                    {photo.imageUrl ? (
                      <img
                        src={photo.imageUrl}
                        alt={photo.caption ?? "Duo Snap photo"}
                        className="aspect-[4/3] w-full object-cover"
                      />
                    ) : (
                      <div className="bg-muted text-muted-foreground flex aspect-[4/3] items-center justify-center px-6 text-center text-sm">
                        Storage signing is not configured yet.
                      </div>
                    )}
                    <CardContent className="space-y-2 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold">
                          {photo.author.displayName ?? photo.author.email}
                        </p>
                        <Badge variant="secondary">{formatTime(photo.createdAt)}</Badge>
                      </div>
                      {photo.caption && (
                        <p className="text-muted-foreground">{photo.caption}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.button>
              ))}
            </AnimatePresence>
          </section>
        </div>
      </section>

      <Dialog open={Boolean(selectedPhoto)} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl overflow-hidden p-0">
          {selectedPhoto && (
            <>
              {selectedPhoto.imageUrl ? (
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.caption ?? "Duo Snap photo"}
                  className="max-h-[70vh] w-full object-cover"
                />
              ) : (
                <div className="bg-muted flex h-80 items-center justify-center">
                  Signed URL unavailable
                </div>
              )}
              <DialogHeader className="p-6">
                <DialogTitle>
                  {selectedPhoto.author.displayName ?? selectedPhoto.author.email}
                </DialogTitle>
                <DialogDescription>
                  {selectedPhoto.caption || "A quiet little snap."}
                </DialogDescription>
              </DialogHeader>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

function StatusLine({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-black/[0.03] px-3 py-2 dark:bg-white/[0.04]">
      <span>{label}</span>
      <Badge variant={ok ? "success" : "outline"}>{ok ? "ready" : "missing"}</Badge>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="grid gap-4">
      {[0, 1].map((item) => (
        <Card key={item} className="overflow-hidden p-0">
          <div className="bg-muted h-64 animate-pulse" />
          <CardContent className="space-y-3 p-5">
            <div className="bg-muted h-4 w-40 animate-pulse rounded" />
            <div className="bg-muted h-4 w-2/3 animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

