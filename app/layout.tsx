import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Laboratório Hawkins — Arquivo 011: Incidente Dimensional",
  description: "Investigue o incidente dimensional do Laboratório Hawkins usando Geometria Espacial. Plataforma educacional gamificada.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Laboratório Hawkins — Arquivo 011",
    description: "Algo foi aberto. Use Geometria Espacial para descobrir o que aconteceu.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050507",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-void text-bone">{children}</body>
    </html>
  );
}
