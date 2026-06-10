import { BootHero } from "@/components/hero/BootHero";
import { Positioning } from "@/components/sections/Positioning";
import { SystemModules } from "@/components/sections/SystemModules";
import { DreamEngine } from "@/components/sections/DreamEngine";
import { Work } from "@/components/sections/Work";
import { Philosophy } from "@/components/sections/Philosophy";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/sections/Footer";
import { CoreCanvas } from "@/three/CoreCanvas";
import { Choreography } from "@/lib/choreography";

export default function Page() {
  return (
    <>
      {/* fixed 3D layer behind all content; lazy, never blocks first paint */}
      <CoreCanvas />
      <Choreography />

      <main className="relative z-10">
        <BootHero />
        <Positioning />
        <SystemModules />
        <DreamEngine />
        <Work />
        <Philosophy />
        <FinalCTA />
        <Footer />
      </main>
    </>
  );
}
