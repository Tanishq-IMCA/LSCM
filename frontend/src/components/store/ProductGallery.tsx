import { useEffect, useState } from 'react';

export function ProductGallery({ images, name, className = 'h-40' }: { images?: string[]; name: string; className?: string }) {
  const items = images?.length ? images : ['/grayscalemini.png'];
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (items.length < 2) return;
    const timer = window.setInterval(() => setActive(current => (current + 1) % items.length), 2600);
    return () => window.clearInterval(timer);
  }, [items.length]);
  return (
    <div className={`relative overflow-hidden border-b border-white/[0.08] bg-white/[0.025] ${className}`}>
      <img src={items[active % items.length]} alt={name} className="h-full w-full object-cover opacity-75 transition duration-500" />
      {items.length > 1 && <div className="absolute bottom-2 left-3 right-3 flex h-px gap-0.5">{items.map((_, index) => <span key={index} className={`h-px flex-1 ${index === active % items.length ? 'bg-[var(--accent)]' : 'bg-white/20'}`} />)}</div>}
    </div>
  );
}