import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { AppShellWrapper } from "@/components/AppShellWrapper";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
 title: "Central de Propostas Acadêmicas",
 description: "Sistema para análise e aprovação de novas propostas de cursos e projetos.",
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="pt-BR" suppressHydrationWarning>
 <body className={inter.className} suppressHydrationWarning>
 <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
 <AppProvider>
 <AppShellWrapper>{children}</AppShellWrapper>
 </AppProvider>
 <Toaster richColors position="top-right" />
 </ThemeProvider>
 </body>
 </html>
 );
}
