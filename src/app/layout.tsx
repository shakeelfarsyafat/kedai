import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brew Bean | Temukan Teman Harimu",
  description: "Pesan aneka kopi nikmat, minuman segar, dan menu lezat favoritmu di Brew Bean secara praktis langsung dari smartphone Anda.",
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#007b9e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-slate-800 selection:bg-[#007b9e] selection:text-white">
        {children}
      </body>
    </html>
  );
}
