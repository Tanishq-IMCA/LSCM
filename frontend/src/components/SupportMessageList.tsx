import { useRef, useState } from 'react';
import type { SupportMessage } from '@/lib/api';

type Props = {
  messages: SupportMessage[];
  draft: string;
  currentUserId: string;
  typingLabel: string;
  onReply: (message: SupportMessage) => void;
  onTogglePin: (message: SupportMessage, pinned: boolean) => void | Promise<void>;
  onDelete?: (message: SupportMessage) => void | Promise<void>;
};

function dayLabel(value: string) {
  const parts = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: 'numeric',
    year: 'numeric',
  }).formatToParts(new Date(value));
  const get = (type: string) => parts.find(part => part.type === type)?.value || '';
  return `${get('weekday')} ${get('day')} ${get('year')}`;
}

function timeLabel(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function miniTimestamp(value: string) {
  return `${dayLabel(value)} · ${timeLabel(value)}`;
}

type PinnedMessagesButtonProps = {
  messages: SupportMessage[];
  onTogglePin: (message: SupportMessage, pinned: boolean) => void | Promise<void>;
};

export function PinnedMessagesButton({ messages, onTogglePin }: PinnedMessagesButtonProps) {
  const [open, setOpen] = useState(false);
  const pinnedMessages = messages.filter(message => message.pinnedAt);

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(value => !value)} aria-label="Open pinned messages" className={`flex items-center gap-2 border px-3 py-2 text-[9px] uppercase tracking-[0.14em] transition ${open || pinnedMessages.length ? 'border-[var(--accent)]/45 bg-[var(--accent)]/[0.08] text-[var(--accent)]' : 'border-white/15 text-white/45 hover:border-white/30 hover:text-white'}`}>
        <span className="text-sm leading-none">⌖</span>
        <span>Pinned</span>
        <span className="text-[8px] text-white/35">{pinnedMessages.length}/2</span>
      </button>
      {open && <div className="absolute right-0 top-full z-40 mt-3 w-80 border border-white/15 bg-[#0b0812]/85 p-3 shadow-2xl backdrop-blur-2xl">
        <div className="mb-3 flex items-center justify-between border-b border-white/[0.08] pb-3"><span className="text-[9px] uppercase tracking-[0.22em] text-[var(--accent)]">Pinned messages</span><span className="text-[9px] uppercase text-white/30">{pinnedMessages.length} of 2</span></div>
        {pinnedMessages.length === 0 ? <p className="py-4 text-center text-[10px] uppercase tracking-[0.12em] text-white/30">No pinned messages</p> : <div className="space-y-2">{pinnedMessages.map(message => <div key={message.id} className="flex items-start gap-3 border border-white/[0.08] bg-white/[0.035] p-3"><div className="min-w-0 flex-1"><p className="line-clamp-2 text-xs leading-5 text-white/70">{message.body}</p><p className="mt-2 text-[8px] uppercase tracking-[0.12em] text-white/30">{miniTimestamp(message.createdAt)}</p></div><button type="button" onClick={() => void onTogglePin(message, false)} aria-label="Unpin message" className="shrink-0 text-lg leading-none text-white/35 transition hover:text-red-200">×</button></div>)}</div>}
      </div>}
    </div>
  );
}

export default function SupportMessageList({ messages, draft, currentUserId, typingLabel, onReply, onTogglePin, onDelete }: Props) {
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [highlightedId, setHighlightedId] = useState('');
  const [menuId, setMenuId] = useState('');
  const jumpTo = (id: string) => {
    messageRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightedId(id);
    window.setTimeout(() => setHighlightedId(current => current === id ? '' : current), 1200);
  };

  let previousDay = '';
  return (
    <div className="flex-1 space-y-3 overflow-y-auto p-5">
      {messages.map(message => {
        const day = dayLabel(message.createdAt);
        const showDay = day !== previousDay;
        previousDay = day;
        const target = message.replyToId ? messages.find(item => item.id === message.replyToId) : null;
        const own = message.senderId === currentUserId;
        return (
          <div key={message.id}>
            {showDay && <div className="my-5 flex items-center gap-3 text-[9px] uppercase tracking-[0.25em] text-white/25"><span className="h-px flex-1 bg-white/10" /><span>{day}</span><span className="h-px flex-1 bg-white/10" /></div>}
            <div ref={node => { messageRefs.current[message.id] = node; }} className={`relative ${highlightedId === message.id ? 'rounded-sm ring-1 ring-[var(--accent)]/70' : ''}`}>
              <div className={message.senderRole === 'system' ? 'mx-auto max-w-xl border border-yellow-200/15 bg-yellow-100/[0.04] p-3 text-center' : `max-w-[85%] border border-white/[0.08] p-3 ${own ? 'ml-auto bg-[var(--accent)]/[0.1]' : 'bg-white/[0.03]'}`}>
                {target && <button type="button" onClick={() => jumpTo(target.id)} className="mb-3 flex w-full border-l-2 border-[var(--accent)]/65 pl-3 text-left text-[10px] leading-4 text-white/45 transition hover:text-white/75"><span className="truncate">Replying to {target.senderRole === 'system' ? 'LSCM system' : target.senderRole}: {target.body}</span></button>}
                <p className="whitespace-pre-wrap text-sm leading-6 text-white/75">{message.body}</p>
                <div className="mt-2 flex items-center justify-between gap-3 text-[9px] uppercase tracking-[0.14em] text-white/30"><span>{message.senderRole === 'system' ? 'LSCM system' : own ? (message.readAt ? 'Read' : 'Delivered') : 'Delivered'} · {timeLabel(message.createdAt)}</span>{message.senderRole !== 'system' && <div className="relative flex items-center gap-3"><button type="button" onClick={() => onReply(message)} className="text-white/35 transition hover:text-[var(--accent)]">Reply ↩</button><button type="button" onClick={() => void onTogglePin(message, !message.pinnedAt)} aria-label={message.pinnedAt ? 'Unpin message' : 'Pin message'} title={message.pinnedAt ? 'Unpin message' : 'Pin message'} className={`text-sm leading-none transition ${message.pinnedAt ? 'text-[var(--accent)]' : 'text-white/30 hover:text-[var(--accent)]'}`}>⌖</button>{onDelete && <><button type="button" aria-label="Message actions" onClick={() => setMenuId(menuId === message.id ? '' : message.id)} className="text-base leading-none text-white/35 hover:text-white">⋯</button>{menuId === message.id && <div className="absolute bottom-5 right-0 z-30 w-32 border border-white/15 bg-[#0b0812] p-1 text-left shadow-2xl"><button type="button" onClick={() => { void onDelete(message); setMenuId(''); }} className="block w-full px-3 py-2 text-left text-[9px] uppercase tracking-[0.12em] text-red-200/70 hover:bg-red-300/[0.08] hover:text-red-200">Delete</button></div>}</>}</div>}</div>
              </div>
            </div>
          </div>
        );
      })}
      {draft.trim() && <div className="ml-auto max-w-[85%] border border-dashed border-[var(--accent)]/60 bg-[var(--accent)]/[0.04] p-3"><p className="whitespace-pre-wrap text-sm leading-6 text-white/60">{draft}</p><p className="mt-2 text-[9px] uppercase tracking-[0.14em] text-[var(--accent)]/70">Draft · not sent</p></div>}
      {typingLabel && <p className="text-xs italic text-white/35">{typingLabel}</p>}
    </div>
  );
}