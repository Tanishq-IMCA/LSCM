type GridItem = {
  eyebrow: string;
  title: string;
  text: string;
};

export function SectionGrid({
  heading,
  items,
}: {
  heading: string;
  items: GridItem[];
}) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-14">
      <div className="mb-8 flex items-end justify-between gap-6">
        <h2 className="font-display text-3xl uppercase text-white sm:text-4xl">{heading}</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {items.map((item) => (
          <article key={item.title} className="glass-panel rounded-lg p-6">
            <p className="font-body text-xs uppercase text-accent">{item.eyebrow}</p>
            <h3 className="mt-4 font-display text-2xl uppercase text-white">{item.title}</h3>
            <p className="mt-4 font-body text-sm leading-7 text-slate-300">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
