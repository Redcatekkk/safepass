import dynamic from "next/dynamic";

const ParticleHero = dynamic(
  () => import("@/components/ui/particle-effect-for-hero"),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="h-screen overflow-hidden">
      <ParticleHero />
    </div>
  );
}
