import type { Metadata } from "next";
import { SignInPanel } from "@/components/sign-in-panel";

export const metadata: Metadata = { title: "Sign in" };

interface SearchParams {
  next?: string;
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { next } = await searchParams;
  // Only allow in-app return paths — no open redirects.
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  return <SignInPanel next={safeNext} />;
}
