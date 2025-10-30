import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ui/toaster";
import { KeyboardShortcuts } from "@/components/ui/keyboard-shortcuts";
import "./globals.css";
import "./print.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Franchise Reorder Calculator",
  description: "Manage chicken orders, budgets, and supplies for Calamias Fried Chicken",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Calamias Chicken",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-gray-100`}
      >
        <ToastProvider>
          <KeyboardShortcuts />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
