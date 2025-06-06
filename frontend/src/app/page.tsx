import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, BookOpen } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-center px-4">
      <h1 className="text-center text-5xl sm:text-6xl font-extrabold mb-6 leading-tight drop-shadow-md">
        <span className="text-muted-foreground block mb-1 tracking-widest text-base sm:text-xl uppercase">
          Bem-vindo ao
        </span>
        <span className="bg-gradient-to-r from-primary to-slate-300 bg-clip-text text-transparent">
          DV Finance
        </span>
      </h1>

      <p className="text-lg text-muted-foreground max-w-2xl mb-10">
        Sua plataforma completa para gerenciar clientes e seus ativos financeiros de forma eficiente e intuitiva.
        Mantenha o controle total sobre seus investimentos e a carteira de seus clientes.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
        <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-muted/50">
          <Users className="h-12 w-12 text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">Gestão de Clientes</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Cadastre, edite e visualize todos os seus clientes em um só lugar.
          </p>
          <Link href="/clients">
            <Button size="lg" className="w-full">Gerenciar Clientes</Button>
          </Link>
        </div>

        <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-muted/50">
          <TrendingUp className="h-12 w-12 text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">Portfólio de Ativos</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Acompanhe os ativos de cada cliente e gerencie seus investimentos.
          </p>
          <Link href="/assets">
            <Button size="lg" className="w-full">Visualizar Ativos</Button>
          </Link>
        </div>

        <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-muted/50">
          <BookOpen className="h-12 w-12 text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">Catálogo de Ativos</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Explore uma lista de ativos disponíveis para investimento.
          </p>
          <Link href="/catalog">
            <Button size="lg" className="w-full">Ver Catálogo</Button>
          </Link>
        </div>
      </div>

      <div className="mt-12 text-muted-foreground text-sm text-center">
        <p>&copy; {new Date().getFullYear()} DV Finance. Todos os direitos reservados.</p>
        <p>Desenvolvido com paixão por finanças e tecnologia.</p>
      </div>
    </div>
  );
}