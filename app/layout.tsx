import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SimpleHeader } from "@/components/layout/simple-header";
// DataProvider removed - now using domain-based hooks

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tour Operator - Inventory Management",
  description: "Modern B2B SaaS for tour operator inventory management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          defaultTheme="system"
          storageKey="tour-operator-theme"
        >
          <div className="min-h-screen">
            <SimpleHeader/>
            <div className="flex">
              <AppSidebar />
              <main className="flex-1 lg:ml-64 rounded-tl-xl">
                <div className="mx-auto lg:p-6 rounded-tl-xl">
                  {children}
                </div>
              </main>
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}