import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KROMA Coffee & Eatery | Specialty Coffee & Online Ordering",
  description: "Pesan kopi artisanal, manual brew single origin, dan pastry lezat secara instan langsung dari meja Anda.",
};

export const viewport: Viewport = {
  themeColor: "#120c08",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#120c08] text-[#f7f3ed] selection:bg-amber-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
