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
      <body className={inter.className}>
        <QueryProvider>
          <header className="bg-primary text-primary-foreground p-4">
            <nav className="container mx-auto flex justify-between">
              <Link href="/" className="text-lg font-bold">Home</Link>
              <div>
                <Link href="/clients" className="mr-4 hover:underline">Clientes</Link>
                <Link href="/assets" className="mr-4 hover:underline">Ativos (Por Cliente)</Link>
                <Link href="/catalog" className="hover:underline">Catálogo de Ativos</Link>
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