import { useRef, useState } from 'react';

const EMOJIS = ['😀', '😂', '🔥', '✅', '⚠️', '🎉', '🚗', '💜', '📢', '👋', '⭐', '🛠️'];

type EmojiFieldProps = {
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
  maxLength?: number;
};

export default function EmojiField({
  value,
  onChange,
  multiline = false,
  className = '',
  placeholder,
  maxLength,
}: EmojiFieldProps) {
  const fieldRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [open, setOpen] = useState(false);

  const insertEmoji = (emoji: string) => {
    const field = fieldRef.current;
    const start = field?.selectionStart ?? value.length;
    const end = field?.selectionEnd ?? value.length;
    onChange(`${value.slice(0, start)}${emoji}${value.slice(end)}`);
    setOpen(false);
    window.requestAnimationFrame(() => {
      field?.focus();
      const cursor = start + emoji.length;
      field?.setSelectionRange(cursor, cursor);
    });
  };

  const sharedProps = {
    value,
    placeholder,
    maxLength,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
    className: `${className} pr-12`,
  };

  return (
    <div className="relative">
      {multiline ? (
        <textarea ref={fieldRef as React.RefObject<HTMLTextAreaElement>} {...sharedProps} />
      ) : (
        <input ref={fieldRef as React.RefObject<HTMLInputElement>} type="text" {...sharedProps} />
      )}
      <button
        type="button"
        aria-label="Open emoji picker"
        onClick={() => setOpen(current => !current)}
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center border border-white/10 bg-black/30 text-base text-white/70 transition hover:border-[var(--accent)]/60 hover:text-white"
      >
        ☺
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 grid w-52 grid-cols-6 gap-1 border border-white/15 bg-[#100b1d] p-2 shadow-2xl">
          {EMOJIS.map(emoji => (
            <button
              key={emoji}
              type="button"
              onClick={() => insertEmoji(emoji)}
              className="flex h-8 w-8 items-center justify-center text-base transition hover:bg-[var(--accent)]/20"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}