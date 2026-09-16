import type { Metadata, Viewport } from "next";
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
  title: "ResepKu - Inspirasi Resep Masakan Khas Nusantara",
  description:
    "Eksplorasi ribuan ide resep masakan rumahan Indonesia dengan takaran pas, checklist bahan, dan pengatur waktu masak interaktif. Bersumber dari Cookpad.",
  keywords: [
    "resep masakan",
    "kuliner nusantara",
    "masakan indonesia",
    "resep ayam",
    "makan siang",
    "cookpad indonesia",
    "ide masakan harian",
  ],
  authors: [{ name: "ResepKu" }],
  openGraph: {
    title: "ResepKu - Inspirasi Resep Masakan Khas Nusantara",
    description:
      "Temukan resep masakan rumahan Indonesia yang lezat, praktis, dan mudah dibuat.",
    type: "website",
    locale: "id_ID",
    siteName: "ResepKu",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f8faf9] dark:bg-[#0d1512]">{children}</body>
    </html>
  );
}
