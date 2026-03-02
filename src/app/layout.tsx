import type { Metadata } from "next";
import { Geist, Geist_Mono, Paprika, Philosopher } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const paprika = Paprika({
  variable: "--font-paprika",
  weight: "400",
  subsets: ["latin"],
});

const philosopher = Philosopher({
  variable: "--font-philosopher",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Humor Study",
  description: "A meme rating application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${paprika.variable} ${philosopher.variable} antialiased`}
      >
        <Sidebar />
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
