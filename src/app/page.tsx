import { DuoSnapApp } from "@/components/duo-snap-app";
import { TRPCReactProvider } from "@/trpc/react";

export default function Home() {
  return <TRPCReactProvider><DuoSnapApp /></TRPCReactProvider>;
}
