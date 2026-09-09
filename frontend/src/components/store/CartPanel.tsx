'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { showNotice } from '@/components/ui/NexusNotice';

export function CartPanel() {
  const { user } = useAuth();
  const { items, totalQuantity, totalPrice, isLoading, updateItem, removeItem, checkout } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckout, setIsCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const groups = useMemo(() => {
    const grouped = new Map<string, typeof items>();
    items.forEach((item) => {
      const group = grouped.get(item.category) || [];
      group.push(item);
      grouped.set(item.category, group);
    });
    return Array.from(grouped.entries());
  }, [items]);

  const submitRequest = async () => {
    setIsSubmitting(true);
    try {
      await checkout();
      setIsCheckout(false);
      setIsOpen(false);
      showNotice('REQUEST SENT', 'Your selected items are now in your account requests.', 'success');
    } catch (error) {
      showNotice('CHECKOUT FAILED', error instanceof Error ? error.message : 'Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSignInNotice = () => {
    showNotice('SIGN IN REQUIRED', 'Sign in to save items to your LSCM cart.', 'info');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => user ? setIsOpen(true) : addSignInNotice()}
        className="store-filter inline-flex items-center gap-2"
        aria-label="Open cart"
      >
        CART <span className="text-[var(--accent)]">[{totalQuantity}/20]</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[70]">
          <button type="button" aria-label="Close cart" className="absolute inset-0 bg-black/60" onClick={() => setIsOpen(false)} />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-white/10 bg-[#0a0712]/95 p-6 shadow-2xl backdrop-blur-2xl md:p-8">
            <div className="flex items-start justify-between border-b border-white/10 pb-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--accent)]" style={{ fontFamily: 'var(--font-mono)' }}>LSCM // REQUEST CART</p>
                <h2 className="mt-3 text-3xl uppercase tracking-[0.08em] text-white" style={{ fontFamily: 'var(--font-display)' }}>{isCheckout ? 'Review request' : 'Your selection'}</h2>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="text-2xl text-white/40 hover:text-white" aria-label="Close cart">×</button>
            </div>

            {isCheckout ? (
              <div className="flex flex-1 flex-col">
                <p className="mt-6 text-sm leading-7 text-white/45" style={{ fontFamily: 'var(--font-body)' }}>Review your request below. Submitting sends these items to your account for management to confirm availability and delivery.</p>
                <div className="mt-6 space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border border-white/[0.08] bg-white/[0.03] p-4">
                      <div><p className="text-sm uppercase tracking-[0.08em] text-white">{item.productName}</p><p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/35">{item.category} · Qty {item.quantity}</p></div>
                      <p className="text-lg text-white">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-auto border-t border-white/10 pt-5">
                  <div className="flex items-center justify-between text-sm uppercase tracking-[0.16em] text-white/50"><span>Request total</span><strong className="text-2xl text-white">${totalPrice.toFixed(2)}</strong></div>
                  <button type="button" disabled={isSubmitting} onClick={submitRequest} className="mt-5 w-full bg-[var(--accent)] px-5 py-4 text-[10px] uppercase tracking-[0.28em] text-black disabled:opacity-50">{isSubmitting ? 'Sending request...' : 'Send request'}</button>
                  <button type="button" onClick={() => setIsCheckout(false)} className="mt-3 w-full border border-white/10 px-5 py-3 text-[10px] uppercase tracking-[0.28em] text-white/50 hover:text-white">Back to cart</button>
                </div>
              </div>
            ) : (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto py-5">
                  {isLoading ? <p className="py-12 text-center text-xs uppercase tracking-[0.2em] text-white/35">Loading cart...</p> : items.length === 0 ? (
                    <div className="py-16 text-center">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/35">Your cart is empty</p>
                      <p className="mt-3 text-sm text-white/30">Add a service or outfit to start a request.</p>
                    </div>
                  ) : groups.map(([category, group]) => (
                    <section key={category} className="mb-7">
                      <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-[var(--accent)]" style={{ fontFamily: 'var(--font-mono)' }}>{category}</p>
                      <div className="space-y-3">
                        {group.map((item) => (
                          <div key={item.id} className="border border-white/[0.08] bg-white/[0.03] p-4">
                            <div className="flex gap-3">
                              <img src={item.imagePath || '/grayscalemini.png'} alt="" className="h-12 w-12 object-contain opacity-60 grayscale" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3"><p className="truncate text-sm uppercase tracking-[0.08em] text-white">{item.productName}</p><p className="text-sm text-white">${(item.unitPrice * item.quantity).toFixed(2)}</p></div>
                                <div className="mt-3 flex items-center justify-between"><div className="flex items-center gap-2"><button type="button" disabled={item.quantity <= 1} onClick={() => void updateItem(item.id, item.quantity - 1)} className="border border-white/10 px-2 text-white/60 hover:text-white disabled:opacity-25" aria-label={`Decrease ${item.productName}`}>−</button><span className="min-w-5 text-center text-xs text-white/70">{item.quantity}</span><button type="button" disabled={totalQuantity >= 20} onClick={() => void updateItem(item.id, item.quantity + 1)} className="border border-white/10 px-2 text-white/60 hover:text-white disabled:opacity-25" aria-label={`Increase ${item.productName}`}>+</button></div><button type="button" onClick={() => void removeItem(item.id)} className="text-[10px] uppercase tracking-[0.16em] text-red-300/60 hover:text-red-300">Remove</button></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
                <div className="border-t border-white/10 pt-5">
                  {!user && <Link href="/auth" className="block text-center text-xs text-[var(--accent)]">Sign in to save your cart</Link>}
                  <div className="mt-3 flex items-center justify-between text-sm uppercase tracking-[0.16em] text-white/50"><span>{totalQuantity} item{totalQuantity === 1 ? '' : 's'}</span><strong className="text-2xl text-white">${totalPrice.toFixed(2)}</strong></div>
                  <button type="button" disabled={!items.length} onClick={() => setIsCheckout(true)} className="mt-5 w-full bg-[var(--accent)] px-5 py-4 text-[10px] uppercase tracking-[0.28em] text-black disabled:opacity-30">Continue to checkout</button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </>
  );
}