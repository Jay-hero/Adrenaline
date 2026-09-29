import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Adrenaline Fitness Sport Center",
  description:
    "Adrenaline Fitness — заалны бодит зураг, гишүүнчлэлийн үнэ, дасгалжуулагч, Google Maps байршил. Баянгол дүүрэг, 17-р хороо. 9917-0917.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/adrenaline-logo.jpg",
    shortcut: "/adrenaline-logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
