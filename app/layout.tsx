import type { Metadata } from "next";
import { inter, orbitron } from "@/lib/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
	title: "FrontalMinds Police DRS (Prototype)",
	description: "UI-only demo for Digital Records System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${orbitron.variable} antialiased min-h-screen bg-background text-foreground`}>
        <ThemeProvider>
          <LanguageProvider>
            <AppShell>{children}</AppShell>
            <Toaster richColors position="top-right" />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
