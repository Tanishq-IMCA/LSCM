import type { GetServerSideProps } from 'next';
import { Header } from '@/components/Landing/Header';
import { Footer } from '@/components/Landing/Footer';
import { CartPanel } from '@/components/store/CartPanel';
import { currentUser } from '@/server/auth';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const user = await currentUser(req as never);
  if (!user) return { redirect: { destination: '/auth', permanent: false } };
  return { props: {} };
};

export default function CartPage() {
  return <main className="min-h-screen pt-24"><Header /><section className="mx-auto max-w-4xl px-6 py-16 md:px-10"><p className="text-[10px] uppercase tracking-[0.44em] text-[var(--accent)]">LSCM // MY CART</p><h1 className="mt-5 text-5xl uppercase tracking-[0.08em] text-white md:text-7xl">Your cart.</h1><p className="mt-4 max-w-xl text-sm leading-7 text-white/40">Review selected services and send a request to management.</p><div className="mt-8"><CartPanel initialOpen /></div></section><Footer /></main>;
}