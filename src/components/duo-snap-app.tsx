"use client";

import { Camera, Copy, Heart, ImagePlus, Lock, MessageCircleHeart, Sparkles, TimerReset, UsersRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/trpc/react";

type Snap = { id: string; author: "me" | "partner"; caption: string; imageUrl: string; mood: string; reactions: number; createdAt: string };
const LOCAL_KEY = "duo-snap.local-snaps";

export function DuoSnapApp() {
  const seed = api.snap.seed.useQuery();
  const createPreview = api.snap.createLocalPreview.useMutation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [snaps, setSnaps] = useState<Snap[]>([]);
  const [caption, setCaption] = useState("");
  const [mood, setMood] = useState("💛");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!seed.data) return;
    const saved = window.localStorage.getItem(LOCAL_KEY);
    setSnaps(saved ? JSON.parse(saved) as Snap[] : seed.data.snaps);
  }, [seed.data]);

  useEffect(() => {
    if (snaps.length) window.localStorage.setItem(LOCAL_KEY, JSON.stringify(snaps));
  }, [snaps]);

  const latest = snaps[0];
  const partner = useMemo(() => snaps.find((snap) => snap.author === "partner"), [snaps]);

  async function copyCode() {
    await navigator.clipboard.writeText(seed.data?.couple.inviteCode ?? "DUO-2509");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  async function addMockPartnerSnap() {
    setSnaps((current) => [{
      id: crypto.randomUUID(),
      author: "partner",
      caption: "Em vừa gửi một tấm nè 🫶",
      imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
      mood: "🫶",
      reactions: 1,
      createdAt: new Date().toISOString(),
    }, ...current]);
  }

  function handleFile(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const snap = await createPreview.mutateAsync({ imageUrl: String(reader.result), caption: caption || "Một snap mới gửi riêng cho em", mood });
      setSnaps((current) => [snap, ...current]);
      setCaption("");
      setMood("💛");
    };
    reader.readAsDataURL(file);
  }

  function react(id: string) {
    setSnaps((current) => current.map((snap) => snap.id === id ? { ...snap, reactions: snap.reactions + 1 } : snap));
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#fff8f2] text-[#301819]">
      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-5 py-8 lg:flex-row lg:items-center lg:px-10">
        <div className="absolute left-[-8rem] top-[-7rem] h-80 w-80 rounded-full bg-[#ffc8dd] blur-3xl" />
        <div className="absolute bottom-0 right-[-8rem] h-96 w-96 rounded-full bg-[#ffd166] opacity-50 blur-3xl" />
        <div className="relative z-10 flex-1 space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur"><Lock className="h-4 w-4 text-[#ff6b8a]" />{seed.data?.couple.privacy ?? "Private couple space"}</div>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-5xl font-black tracking-tight sm:text-7xl">Duo Snap cho hai đứa mình.</h1>
            <p className="max-w-2xl text-lg leading-8 text-[#6f5550]">Một app kiểu Locket nhưng ấm hơn: mở lên là chụp, gửi ngay cho người yêu, giữ timeline riêng tư, reaction bằng tim và caption ngắn.</p>
          </div>
          <div className="grid max-w-2xl gap-4 sm:grid-cols-3">
            <Metric icon={<UsersRound />} label="Couple room" value="2 người" />
            <Metric icon={<TimerReset />} label="Streak" value={String(seed.data?.couple.streak ?? 14)} />
            <Metric icon={<Sparkles />} label="Type-safe" value="tRPC" />
          </div>
          <div className="rounded-[2rem] border border-white/70 bg-white/75 p-4 shadow-2xl shadow-rose-200/40 backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row">
              <button onClick={() => inputRef.current?.click()} className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-[#301819] px-5 py-4 font-bold text-white transition hover:-translate-y-0.5"><Camera className="h-5 w-5" />Chụp/gửi snap</button>
              <button onClick={addMockPartnerSnap} className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-[#ff6b8a] px-5 py-4 font-bold text-white transition hover:-translate-y-0.5"><MessageCircleHeart className="h-5 w-5" />Demo người yêu gửi</button>
            </div>
            <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="Caption nhỏ xíu cho người ấy..." className="rounded-2xl border border-[#f4d6cf] bg-white px-4 py-3 outline-none focus:border-[#ff6b8a]" maxLength={120} />
              <div className="flex gap-2">{["💛", "🫶", "🥹", "✨"].map((emoji) => <button key={emoji} onClick={() => setMood(emoji)} className={"grid h-12 w-12 place-items-center rounded-2xl border text-xl " + (mood === emoji ? "border-[#ff6b8a] bg-[#ffe3ea]" : "border-[#f4d6cf] bg-white")}>{emoji}</button>)}</div>
            </div>
          </div>
        </div>
        <div className="relative z-10 mx-auto w-full max-w-[430px] flex-1">
          <div className="rounded-[3.5rem] border-[12px] border-[#2d1717] bg-[#2d1717] p-3 shadow-2xl shadow-[#ad6d6d]/40">
            <div className="overflow-hidden rounded-[2.7rem] bg-[#fffaf7]">
              <div className="flex items-center justify-between bg-[#fff1ea] px-5 py-4">
                <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff6b8a]">Duo Snap</p><h2 className="text-xl font-black">{seed.data?.couple.name ?? "Kane × Love"}</h2></div>
                <button onClick={copyCode} className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold shadow-sm"><Copy className="h-3.5 w-3.5" />{copied ? "Copied" : seed.data?.couple.inviteCode ?? "DUO-2509"}</button>
              </div>
              <div className="space-y-4 p-4">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#f7dfd7] shadow-inner">
                  {latest ? <img src={latest.imageUrl} alt={latest.caption} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-[#9b6b62]"><ImagePlus className="h-12 w-12" /></div>}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 text-white"><p className="text-4xl">{latest?.mood ?? "💛"}</p><p className="mt-2 text-lg font-bold">{latest?.caption ?? "Snap đầu tiên cho người ấy"}</p></div>
                </div>
                <div className="rounded-[1.75rem] bg-[#2d1717] p-4 text-white">
                  <p className="text-sm text-white/60">Latest from partner</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-16 w-16 overflow-hidden rounded-2xl bg-white/10">{partner && <img src={partner.imageUrl} alt={partner.caption} className="h-full w-full object-cover" />}</div>
                    <div className="min-w-0 flex-1"><p className="truncate font-bold">{partner?.caption ?? "Chưa có snap mới"}</p><p className="text-sm text-white/60">Tap tim để reaction</p></div>
                    <button onClick={() => partner && react(partner.id)} className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ff6b8a]"><Heart className="h-5 w-5 fill-white" /></button>
                  </div>
                </div>
                <div className="space-y-3">{snaps.slice(0, 4).map((snap) => <article key={snap.id} className="flex items-center gap-3 rounded-[1.5rem] bg-white p-3 shadow-sm"><img src={snap.imageUrl} alt={snap.caption} className="h-16 w-16 rounded-2xl object-cover" /><div className="min-w-0 flex-1"><p className="truncate font-bold">{snap.caption}</p><p className="text-sm text-[#96716b]">{snap.author === "me" ? "Bạn" : "Người ấy"}</p></div><button onClick={() => react(snap.id)} className="flex items-center gap-1 rounded-full bg-[#fff0f4] px-3 py-2 text-sm font-bold text-[#ff4f78]"><Heart className="h-4 w-4 fill-[#ff6b8a]" />{snap.reactions}</button></article>)}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur"><div className="mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-[#ffe0e8] text-[#ff4f78]">{icon}</div><p className="text-sm font-medium text-[#8b665f]">{label}</p><p className="text-2xl font-black">{value}</p></div>;
}
