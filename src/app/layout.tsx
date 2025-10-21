import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import {Toaster} from "@/components/ui/sonner";
import {ThemeProvider} from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: [
    "100", "200", "300", "400", "500", "600", "700", "800", "900"
  ]
});

export const metadata: Metadata = {
  title: "PlateMate",
  description: "Your collaborative management tool for teams and your best friend. Manage projects, track tasks, and stay organized effciently",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/**lagay here yung code for dark mode pero nagkakaproblema sya rn */}
        {children}
        <Toaster richColors position="top-center"/>
      </body>
    </html>
  );
}
