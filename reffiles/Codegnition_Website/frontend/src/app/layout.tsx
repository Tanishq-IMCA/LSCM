'use client';

import type { Metadata } from "next";
import localFont from "next/font/local";
import { useEffect } from "react";

import "./globals.css";
import LoadingScreen from "@/components/loading-screen";
import { LoadingProvider } from "@/context/LoadingContext";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import PageTransition from "@/components/PageTransition";
import QueryProvider from "@/components/query-provider";
import { NexusNoticeContainer } from "@/components/NexusNotice";

const displayFont = localFont({
  src: "../../public/fonts/Bourgeois-Book_1769623990028.otf",
  variable: "--font-display",
});

const bodyFont = localFont({
  src: "../../public/fonts/Bourgeois-Book_1769623990028.otf",
  variable: "--font-body",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    const updateCursor = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', updateCursor);
    return () => window.removeEventListener('mousemove', updateCursor);
  }, []);

  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        <QueryProvider>
          <AuthProvider>
            <CartProvider>
              <LoadingProvider>
                <NexusNoticeContainer />
                <LoadingScreen />
                <div className="wallpaper-layer">
                  <div className="blob blob-1"></div>
                  <div className="blob blob-2"></div>
                  <div className="blob blob-3"></div>
                  <div className="blob blob-4"></div>
                  <div className="blob blob-5"></div>
                  <div className="blob blob-6"></div>
                </div>
                <div className="frost-layer"></div>
                <PageTransition>{children}</PageTransition>
              </LoadingProvider>
            </CartProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}