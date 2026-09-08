import { SectionGrid } from "@/components/section-grid";
import { SiteHeader } from "@/components/site-header";

const aboutItems = [
  {
    eyebrow: "Architecture",
    title: "Decoupled",
    text: "Next.js handles the interface layer while Python remains free to own heavier backend logic later.",
  },
  {
    eyebrow: "UI",
    title: "Controlled Glass",
    text: "Blur stays shallow and isolated so the visual language remains clean without turning into a GPU tax.",
  },
  {
    eyebrow: "Pipeline",
    title: "Phased",
    text: "Public routes come first, then client identity, then the full administrative command surface.",
  },
];

export default function AboutPage() {
  return (
    <main>
      <SiteHeader current="about" />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="font-body text-xs uppercase text-accent">About Us</p>
          <h1 className="mt-4 font-display text-5xl uppercase text-white">How CODEGNITION Is Being Built</h1>
          <p className="mt-5 font-body text-base leading-7 text-slate-300">
            The current pass establishes the public shell, a backend bridge, and the internal route
            boundary that the roadmap calls for.
          </p>
        </div>
      </section>
      <SectionGrid heading="Build Principles" items={aboutItems} />
    </main>
  );
}
