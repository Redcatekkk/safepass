import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import PasswordGenerator from "@/components/ui/password-generator";

export const metadata: Metadata = {
  title: "Generate Password",
  description:
    "Create a strong, secure password instantly with SafePass. Choose length, character types, passphrases, or PINs — all processed in your browser with zero data stored.",
  keywords: [
    "generate password",
    "password generator tool",
    "create strong password",
    "secure password online",
    "random password maker",
    "passphrase generator",
    "PIN generator",
  ],
};

const AntiGravityBg = dynamic(
  () =>
    import("@/components/ui/particle-effect-for-hero").then(
      (mod) => mod.AntiGravityCanvas
    ),
  { ssr: false }
);

export default function GeneratePage() {
  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* Particle canvas — fills entire viewport, interactive via window listeners */}
      <AntiGravityBg />

      {/* Minimal top nav */}
      <nav className="absolute top-0 left-0 w-full z-20 flex items-center justify-between p-6 md:p-8 pointer-events-none">
        <Link
          href="/"
          className="pointer-events-auto flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Safe Pass
        </Link>
        <span className="text-xs font-mono text-white/20 tracking-widest uppercase">Secure Generator</span>
      </nav>

      {/* Generator — glass panel centered over the canvas */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center py-28 px-4">
        <div className="w-full max-w-xl">
          {/* Eyebrow label */}
          <div className="mb-4 text-center">
            <span className="py-1 px-3 border border-white/15 rounded-full text-xs font-mono text-white/40 tracking-widest uppercase bg-white/5 backdrop-blur-sm">
              Generate a strong password
            </span>
          </div>

          {/* Glass card */}
          <div className="rounded-3xl border border-white/10 bg-black/30 backdrop-blur-2xl shadow-[0_8px_60px_rgba(0,0,0,0.6)]">
            <PasswordGenerator />
          </div>
        </div>
      </div>
    </div>
  );
}
