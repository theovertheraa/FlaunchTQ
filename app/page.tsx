import { Hero } from "@/components/marketplace/hero";
import { DiscoveryBar } from "@/components/marketplace/discovery-bar";
import { SiteShell } from "@/components/layout/site-shell";

export default function HomePage() {
  return (
    <SiteShell>
      <div className="space-y-8">
        <Hero />
        <DiscoveryBar />
      </div>
    </SiteShell>
  );
}
