import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "FlowFunded | Next-Gen Prop Firm - Trade Up to $2,000,000 Capital",
  description:
    "Pass our evaluation challenge, verify your consistency, and trade with simulated capital up to $2,000,000. Keep up to 90% of your gains.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-primary/30 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">
            <ScrollReveal>{children}</ScrollReveal>
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
