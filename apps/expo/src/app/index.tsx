import type { Session } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import * as Linking from "expo-linking";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LegendList } from "@legendapp/list";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, LogOut, Send, X } from "lucide-react-native";

import { SNAP_BUCKET } from "@duo-snap/auth";

import type { RouterOutputs } from "~/utils/api";
import { trpc } from "~/utils/api";
import { supabase } from "~/utils/supabase";

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function PostCard(props: { post: RouterOutputs["photos"]["list"][number] }) {
  const { post } = props;

  return (
    <View className="mb-4 overflow-hidden rounded-[2rem] bg-zinc-900 shadow-2xl">
      {post.imageUrl ? (
        <View className="aspect-[3/4] w-full bg-zinc-800">
          <Text className="text-zinc-500 absolute inset-0 flex items-center justify-center p-4 text-center">
            {/* Real React Native Image goes here; placeholder for mock */}
            ImageUrl: {post.imageUrl.slice(0, 30)}...
          </Text>
        </View>
      ) : (
        <View className="flex aspect-[3/4] w-full items-center justify-center bg-zinc-800">
          <Text className="text-zinc-400">Loading...</Text>
        </View>
      )}

      <BlurView intensity={80} tint="dark" className="absolute bottom-0 w-full p-5">
        <View className="flex-row items-center justify-between gap-3">
          <Text className="font-semibold text-white">
            {post.author.displayName ?? post.author.email}
          </Text>
          <Text className="text-zinc-300 text-xs">
            {formatTime(post.createdAt)}
          </Text>
        </View>
        {post.caption && (
          <Text className="text-zinc-200 mt-2 text-sm">{post.caption}</Text>
        )}
      </BlurView>
    </View>
  );
}

export default function Index() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhoto, setCapturedPhoto] = useState<any>(null);
  const [caption, setCaption] = useState("");

  const cameraRef = useRef<CameraView>(null);

  const photosQuery = useQuery(
    trpc.photos.list.queryOptions(undefined, {
      enabled: Boolean(session),
    }),
  );

  const uploadUrlMutation = useMutation(
    trpc.photos.createUploadUrl.mutationOptions(),
  );

  const createPhotoMutation = useMutation(
    trpc.photos.create.mutationOptions({
      onSettled: () => {
        setCameraOpen(false);
        setCapturedPhoto(null);
        setCaption("");
        void queryClient.invalidateQueries(trpc.photos.list.queryFilter());
      },
    }),
  );

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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      void queryClient.invalidateQueries();
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  async function handleLogin() {
    if (!supabase) {
      Alert.alert("Error", "Supabase is not configured yet.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: Linking.createURL("/"),
      },
    });

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Success", "Magic link sent to your email. You can close this and click the link.");
  }

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  async function takePicture() {
    if (!cameraRef.current || !cameraReady) return;
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.7,
      base64: false,
    });
    setCapturedPhoto(photo);
  }

  async function handleSend() {
    if (!supabase || !capturedPhoto) return;

    try {
      const ext = capturedPhoto.uri.split(".").pop() || "jpg";
      const fileName = `snap.${ext}`;
      const contentType = `image/${ext === "jpg" ? "jpeg" : ext}`;

      const upload = await uploadUrlMutation.mutateAsync({
        fileName,
        contentType,
      });

      const response = await fetch(capturedPhoto.uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from(SNAP_BUCKET)
        .uploadToSignedUrl(upload.path, upload.token, blob);

      if (uploadError) throw uploadError;

      await createPhotoMutation.mutateAsync({
        imagePath: upload.path,
        caption,
      });
    } catch (error) {
      Alert.alert("Upload Failed", String(error));
    }
  }

  if (!authReady) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-950">
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  if (!session) {
    return (
      <View className="flex-1 justify-center bg-zinc-950 p-6">
        <View className="mb-12 items-center">
          <Heart size={64} color="#ff4d8d" fill="#ff4d8d" />
          <Text className="mt-6 text-center text-4xl font-black text-white">
            Duo Snap
          </Text>
          <Text className="text-zinc-400 mt-2 text-center text-lg">
            A private feed just for two.
          </Text>
        </View>

        <TextInput
          className="border-zinc-800 bg-zinc-900 text-zinc-100 h-14 rounded-xl border px-4 text-lg"
          placeholder="person1@example.com"
          placeholderTextColor="#52525b"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Pressable
          className="mt-4 h-14 items-center justify-center rounded-xl bg-[#ff4d8d]"
          onPress={handleLogin}
        >
          <Text className="text-lg font-bold text-white">Send Magic Link</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-zinc-950" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 pb-2 pt-2">
        <Text className="text-2xl font-black tracking-tighter text-[#ff4d8d]">
          Duo Snap
        </Text>
        <Pressable onPress={handleSignOut} className="p-2">
          <LogOut size={24} color="#52525b" />
        </Pressable>
      </View>

      <LegendList
        data={photosQuery.data ?? []}
        estimatedItemSize={400}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyExtractor={(item) => item.id}
        renderItem={(p) => <PostCard post={p.item} />}
      />

      <BlurView
        intensity={80}
        tint="dark"
        className="absolute bottom-0 w-full flex-row justify-center pb-8 pt-4"
      >
        <Pressable
          className="h-20 w-20 items-center justify-center rounded-full bg-[#ff4d8d] shadow-xl"
          onPress={() => setCameraOpen(true)}
        >
          <View className="h-16 w-16 rounded-full border-4 border-white/30" />
        </Pressable>
      </BlurView>

      <Modal visible={cameraOpen} animationType="slide" transparent={false}>
        <View className="flex-1 bg-black">
          {!capturedPhoto ? (
            <CameraView
              ref={cameraRef}
              className="flex-1"
              facing="back"
              onCameraReady={() => setCameraReady(true)}
            >
              <SafeAreaView className="flex-1 justify-between">
                <View className="flex-row justify-end p-4">
                  <Pressable
                    className="h-12 w-12 items-center justify-center rounded-full bg-black/40"
                    onPress={() => setCameraOpen(false)}
                  >
                    <X size={24} color="#fff" />
                  </Pressable>
                </View>

                <View className="items-center pb-12">
                  <Pressable
                    className="h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-transparent"
                    onPress={takePicture}
                  >
                    <View className="h-20 w-20 rounded-full bg-white" />
                  </Pressable>
                </View>
              </SafeAreaView>
            </CameraView>
          ) : (
            <SafeAreaView className="flex-1 justify-between p-4">
              <View className="flex-row justify-between">
                <Pressable
                  className="h-12 w-12 items-center justify-center rounded-full bg-zinc-800"
                  onPress={() => setCapturedPhoto(null)}
                >
                  <X size={24} color="#fff" />
                </Pressable>
              </View>

              <View className="mb-4 flex-row items-center gap-2">
                <TextInput
                  className="bg-zinc-800 text-zinc-100 flex-1 rounded-full px-5 py-4 text-lg"
                  placeholder="Add a tiny note..."
                  placeholderTextColor="#71717a"
                  value={caption}
                  onChangeText={setCaption}
                />
                <Pressable
                  className="h-14 w-14 items-center justify-center rounded-full bg-[#ff4d8d]"
                  onPress={handleSend}
                >
                  {uploadUrlMutation.isPending || createPhotoMutation.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Send size={20} color="#fff" />
                  )}
                </Pressable>
              </View>
            </SafeAreaView>
          )}
        </View>
      </Modal>
    </View>
  );
}

