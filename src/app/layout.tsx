import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import {Toaster} from "@/components/ui/sonner";
import {ThemeProvider} from "@/components/theme-provider";
import {AuthProvider} from "@/components/providers/auth-provider";
import LayoutWrap from "@/components/general-components/LayoutWrap";
import {Metadata} from "next";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <LayoutWrap>
              {children}
            </LayoutWrap>
            <Toaster richColors position="top-center"/>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
