import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Samilator",
  description: "מערכת אימון מכירות",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary">{children}</body>
    </html>
  );
}
