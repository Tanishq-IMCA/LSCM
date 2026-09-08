"use client";

import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function CartPanel() {
  const { isCartOpen, toggleCart, cartItems, increaseQuantity, decreaseQuantity, totalCost } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={toggleCart}
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
            style={{ willChange: "transform, opacity" }}
            className="absolute top-24 right-8 z-50 w-full max-w-sm glass-panel bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl"
          >
            <div className="flex flex-col max-h-[60vh]">
              <div className="p-5 border-b border-white/10">
                <h2 className="font-display text-xl uppercase tracking-widest text-white">Your Cart</h2>
              </div>

              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                {cartItems.length === 0 ? (
                  <p className="text-center text-white/50 py-8">Your cart is empty.</p>
                ) : (
                  <ul className="space-y-4">
                    {cartItems.map(item => (
                      <li key={item.name} className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-white font-medium truncate">{item.name}</p>
                          <p className="text-white/60 text-sm">${item.price}</p>
                        </div>
                        <div className="flex items-center gap-2 glass-panel p-1 rounded-full">
                          <button onClick={() => decreaseQuantity(item.name)} className="h-6 w-6 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center text-white/70 hover:text-white">-</button>
                          <span className="w-6 text-center font-mono text-sm text-white">{item.quantity}</span>
                          <button onClick={() => increaseQuantity(item.name)} className="h-6 w-6 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center text-white/70 hover:text-white">+</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-5 border-t border-white/10 mt-auto">
                  <div className="flex justify-between items-center font-display text-lg uppercase text-white">
                    <span>Total</span>
                    <span>${totalCost.toFixed(2)}</span>
                  </div>
                  <Link href="/checkout" passHref>
                    <motion.button 
                      onClick={toggleCart}
                      className="w-full mt-4 p-3 rounded-lg bg-accent/90 hover:bg-accent text-white font-bold uppercase tracking-widest transition-colors text-sm"
                    >
                      Proceed to Checkout
                    </motion.button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}