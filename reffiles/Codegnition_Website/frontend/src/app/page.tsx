import { Hero } from "@/components/hero";
import { SectionGrid } from "@/components/section-grid";
import { SiteHeader } from "@/components/site-header";

const landingSections = [
  {
    eyebrow: "Software",
    title: "Systems",
    text: "Delivery-focused interfaces for agencies, internal tools, and client-facing operations.",
  },
  {
    eyebrow: "Games",
    title: "Prototypes",
    text: "Playable concept work with strong feedback loops and room for later polish passes.",
  },
  {
    eyebrow: "Operations",
    title: "Control",
    text: "A future split between client and admin surfaces, kept separate from public routes.",
  },
];

export default function HomePage() {
  return (
    <main>
      <SiteHeader current="home" />
      <Hero />
      <SectionGrid heading="What The Skeleton Covers" items={landingSections} />
    </main>
  );
}