import { useRef, useState } from 'react';
import type { SupportMessage } from '@/lib/api';

type Props = {
  messages: SupportMessage[];
  draft: string;
  currentUserId: string;
  typingLabel: string;
  onReply: (message: SupportMessage) => void;
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

export default function SupportMessageList({ messages, draft, currentUserId, typingLabel, onReply }: Props) {
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [highlightedId, setHighlightedId] = useState('');

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
                <div className="mt-2 flex items-center justify-between gap-3 text-[9px] uppercase tracking-[0.14em] text-white/30"><span>{message.senderRole === 'system' ? 'LSCM system' : own ? (message.readAt ? 'Read' : 'Delivered') : 'Delivered'} · {timeLabel(message.createdAt)}</span>{message.senderRole !== 'system' && <button type="button" onClick={() => onReply(message)} className="text-white/35 transition hover:text-[var(--accent)]">Reply ↩</button>}</div>
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