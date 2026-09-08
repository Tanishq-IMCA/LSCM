"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/context/AuthContext";

type AuthMode = "login" | "signup";

const panelVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function AuthenticationPage() {
  const router = useRouter();
  const { isLoggedIn, login, signup } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buttonGlowTick, setButtonGlowTick] = useState(0);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/checkout");
    }
  }, [isLoggedIn, router]);

  const modeCopy = useMemo(
    () => ({
      login: {
        eyebrow: "Client Access",
        title: "Log In",
        description:
          "Continue your custom order, saved checkout details, and active purchase flow.",
        toggleLead: "Don't have an account?",
        toggleAction: "Sign up, it's free",
        submitLabel: "Log In",
        submitBusy: "Logging In",
      },
      signup: {
        eyebrow: "New Client",
        title: "Create Account",
        description:
          "Set up a client account before you push marketplace items or custom builds through checkout.",
        toggleLead: "Have an account?",
        toggleAction: "Log in!",
        submitLabel: "Create Account",
        submitBusy: "Creating Account",
      },
    }),
    []
  );

  const activeCopy = modeCopy[mode];

  const flashSubmitButton = () => {
    setButtonGlowTick((current) => current + 1);
  };

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const success = login(loginForm.email, loginForm.password);
    if (!success) {
      setError("Invalid email or password.");
      setIsSubmitting(false);
      return;
    }

    router.push("/checkout");
  };

  const handleSignup = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (signupForm.password !== signupForm.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const result = signup({
      name: signupForm.name.trim(),
      email: signupForm.email.trim(),
      password: signupForm.password,
    });

    if (!result.ok) {
      setError(result.message || "Unable to create account.");
      setIsSubmitting(false);
      return;
    }

    router.push("/checkout");
  };

  return (
    <main className="min-h-screen px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[70rem] items-center justify-center">
        <div
          className="w-full overflow-hidden border border-white/10 bg-black/25 p-8 shadow-lg backdrop-blur-xl md:p-12"
          style={{ borderRadius: "1px" }}
        >
          <div className="mb-8 flex min-h-[10.5rem] flex-col gap-5 border-b border-white/10 pb-7 md:grid md:grid-cols-[1.1fr_0.9fr] md:items-end md:gap-10">
            <div className="min-h-[7rem]">
              <Link
                href="/"
                className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.45em] text-white/55 transition hover:text-white"
              >
                <span className="h-px w-8 bg-white/30" />
                Codegnition
              </Link>
              <p className="mt-6 text-xs uppercase tracking-[0.45em] text-accent">
                {activeCopy.eyebrow}
              </p>
              <div className="mt-4 h-14 overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.h1
                    key={mode}
                    variants={panelVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    className="font-display text-4xl uppercase tracking-[0.14em] text-white md:text-[3.15rem]"
                  >
                    {activeCopy.title}
                  </motion.h1>
                </AnimatePresence>
              </div>
            </div>

            <div className="flex min-h-[7rem] max-w-[26rem] items-end md:justify-self-end md:text-left">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={`${mode}-copy`}
                  variants={panelVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.22 }}
                  className="text-sm leading-7 text-slate-300"
                >
                  {activeCopy.description}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-[0.94fr_1px_1.06fr] md:gap-10">
            <div className="space-y-5">
              <div className="border border-white/10 bg-white/[0.03] p-5" style={{ borderRadius: "1px" }}>
                <p className="font-display text-sm uppercase tracking-[0.28em] text-white">
                  Marketplace
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Ready-built software can move directly into cart.
                </p>
              </div>
              <div className="border border-white/10 bg-white/[0.03] p-5" style={{ borderRadius: "1px" }}>
                <p className="font-display text-sm uppercase tracking-[0.28em] text-white">
                  Custom Orders
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Scoped builds are configured first, then created as cart-ready custom orders.
                </p>
              </div>
              <div className="border border-white/10 bg-white/[0.03] p-5" style={{ borderRadius: "1px" }}>
                <p className="font-display text-sm uppercase tracking-[0.28em] text-white">
                  Demo Access
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  `tanis@example.com` / `demo1234`
                </p>
              </div>
            </div>

            <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />

            <div className="min-h-[31.5rem]">
              <div className="relative min-h-[25rem]">
                <AnimatePresence mode="wait" initial={false}>
                  {mode === "login" ? (
                    <motion.form
                      key="login"
                      onSubmit={handleLogin}
                      variants={panelVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.24 }}
                      className="absolute inset-0 space-y-5"
                    >
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-[0.35em] text-white/55">Email</label>
                        <input
                          type="email"
                          value={loginForm.email}
                          onChange={(event) =>
                            setLoginForm((current) => ({ ...current, email: event.target.value }))
                          }
                          className="w-full border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-white outline-none transition focus:border-accent focus:bg-white/[0.07]"
                          style={{ borderRadius: "1px" }}
                          placeholder="you@company.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-[0.35em] text-white/55">Password</label>
                        <input
                          type="password"
                          value={loginForm.password}
                          onChange={(event) =>
                            setLoginForm((current) => ({ ...current, password: event.target.value }))
                          }
                          className="w-full border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-white outline-none transition focus:border-accent focus:bg-white/[0.07]"
                          style={{ borderRadius: "1px" }}
                          placeholder="Enter your password"
                          required
                        />
                      </div>
                      <div className="min-h-6">
                        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
                      </div>
                      <motion.button
                        key={`submit-login-${buttonGlowTick}`}
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full border border-accent bg-accent/90 px-5 py-4 font-display text-sm uppercase tracking-[0.32em] text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                        style={{ borderRadius: "1px" }}
                        animate={{
                          boxShadow: [
                            "0 0 0 rgba(16,185,129,0)",
                            "0 0 26px rgba(16,185,129,0.85)",
                            "0 0 6px rgba(16,185,129,0.25)",
                            "0 0 28px rgba(16,185,129,0.9)",
                            "0 0 0 rgba(16,185,129,0)",
                          ],
                        }}
                        transition={{ duration: 0.5, times: [0, 0.18, 0.4, 0.68, 1] }}
                      >
                        {isSubmitting ? activeCopy.submitBusy : activeCopy.submitLabel}
                      </motion.button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="signup"
                      onSubmit={handleSignup}
                      variants={panelVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.24 }}
                      className="absolute inset-0 space-y-5"
                    >
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-[0.35em] text-white/55">Full Name</label>
                        <input
                          type="text"
                          value={signupForm.name}
                          onChange={(event) =>
                            setSignupForm((current) => ({ ...current, name: event.target.value }))
                          }
                          className="w-full border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-white outline-none transition focus:border-accent focus:bg-white/[0.07]"
                          style={{ borderRadius: "1px" }}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-[0.35em] text-white/55">Email</label>
                        <input
                          type="email"
                          value={signupForm.email}
                          onChange={(event) =>
                            setSignupForm((current) => ({ ...current, email: event.target.value }))
                          }
                          className="w-full border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-white outline-none transition focus:border-accent focus:bg-white/[0.07]"
                          style={{ borderRadius: "1px" }}
                          placeholder="you@company.com"
                          required
                        />
                      </div>
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-[0.35em] text-white/55">Password</label>
                          <input
                            type="password"
                            value={signupForm.password}
                            onChange={(event) =>
                              setSignupForm((current) => ({ ...current, password: event.target.value }))
                            }
                            className="w-full border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-white outline-none transition focus:border-accent focus:bg-white/[0.07]"
                            style={{ borderRadius: "1px" }}
                            placeholder="Choose a password"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-[0.35em] text-white/55">Confirm</label>
                          <input
                            type="password"
                            value={signupForm.confirmPassword}
                            onChange={(event) =>
                              setSignupForm((current) => ({
                                ...current,
                                confirmPassword: event.target.value,
                              }))
                            }
                            className="w-full border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-white outline-none transition focus:border-accent focus:bg-white/[0.07]"
                            style={{ borderRadius: "1px" }}
                            placeholder="Repeat password"
                            required
                          />
                        </div>
                      </div>
                      <div className="min-h-6">
                        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
                      </div>
                      <motion.button
                        key={`submit-signup-${buttonGlowTick}`}
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full border border-accent bg-accent/90 px-5 py-4 font-display text-sm uppercase tracking-[0.32em] text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                        style={{ borderRadius: "1px" }}
                        animate={{
                          boxShadow: [
                            "0 0 0 rgba(16,185,129,0)",
                            "0 0 26px rgba(16,185,129,0.85)",
                            "0 0 6px rgba(16,185,129,0.25)",
                            "0 0 28px rgba(16,185,129,0.9)",
                            "0 0 0 rgba(16,185,129,0)",
                          ],
                        }}
                        transition={{ duration: 0.5, times: [0, 0.18, 0.4, 0.68, 1] }}
                      >
                        {isSubmitting ? activeCopy.submitBusy : activeCopy.submitLabel}
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              <div className="border-t border-white/10 pt-6">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`toggle-${mode}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                    className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center"
                  >
                    <button
                      type="button"
                      onClick={flashSubmitButton}
                      className="text-sm text-slate-300 transition hover:text-white"
                    >
                      {activeCopy.toggleLead}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setIsSubmitting(false);
                        setMode((current) => (current === "login" ? "signup" : "login"));
                      }}
                      className="inline-flex items-center gap-3 border border-white/15 bg-white/[0.03] px-5 py-3 font-display text-xs uppercase tracking-[0.28em] text-white transition hover:border-accent hover:text-accent-light"
                      style={{ borderRadius: "1px" }}
                    >
                      <span className="h-px w-6 bg-current" />
                      {activeCopy.toggleAction}
                    </button>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
