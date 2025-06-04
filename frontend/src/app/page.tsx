import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)]">
      <h1 className="text-4xl font-bold mb-8">Bem-vindo ao DV Finance</h1>
      <div className="flex space-x-4">
        <Link href="/clients">
          <Button size="lg">Gerenciar Clientes</Button>
        </Link>
        <Link href="/assets">
          <Button size="lg">Visualizar Ativos (Por Cliente)</Button>
        </Link>
        <Link href="/catalog"> 
          <Button size="lg">Ver Catálogo de Ativos</Button>
        </Link>
      </div>
    </div>
  );
}