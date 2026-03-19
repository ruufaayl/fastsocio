import type { Metadata } from "next";
import "./globals.css";
import ToastProvider from "@/components/shared/ToastProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "FASTSOCIO — Your University. Your Reputation. Your Game.",
  description: "The ultimate campus social platform for FAST-NUCES Islamabad.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#0D0D0D" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700,800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <div className="ambient-bg" aria-hidden="true">
          <div className="ambient-orb-3" />
        </div>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
