import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "./query-provider";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DV Finance",
  description: "Projeto para gerenciar clientes e seus ativos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="shortcut icon" href="favicon.png" type="image/x-icon" />
      </head>
      <body className={inter.className}>
        <QueryProvider>
          <header className="bg-primary text-primary-foreground p-4 sm:p-6"> 
            <nav className="container mx-auto flex flex-col sm:flex-row justify-between items-center sm:items-baseline space-y-4 sm:space-y-0">
              <Link href="/" className="text-xl sm:text-lg font-bold whitespace-nowrap">Home</Link>
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <Link href="/clients" className="hover:underline text-base sm:text-sm">Clientes</Link>
                <Link href="/assets" className="hover:underline text-base sm:text-sm">Ativos (Por Cliente)</Link>
                <Link href="/catalog" className="hover:underline text-base sm:text-sm">Catálogo de Ativos</Link>
              </div>
            </nav>
          </header>
          <main className="container mx-auto p-4">
            {children}
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}