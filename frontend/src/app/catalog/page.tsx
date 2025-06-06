'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCatalogAssets, CatalogAsset } from '@/api/assets';
import { LayoutGrid, TrendingUp, DollarSign, Bitcoin, Leaf, Banknote, LandPlot } from 'lucide-react';

export default function AssetsCatalogPage() {
  const { data: catalogAssets, isLoading, error } = useQuery<CatalogAsset[]>({
    queryKey: ['assets-catalog'],
    queryFn: fetchCatalogAssets,
  });

  if (isLoading) return <div>Carregando catálogo de ativos...</div>;
  if (error) return <div>Ocorreu um erro ao carregar o catálogo: {(error as Error).message}</div>;

  const formatterForReal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const getAssetIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'ação':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'moeda':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'cripto':
        return <Bitcoin className="h-5 w-5 text-yellow-500" />;
      case 'commodity':
        return <Leaf className="h-5 w-5 text-amber-700" />;
      case 'título privado':
        return <Banknote className="h-5 w-5 text-purple-500" />;
      case 'título público':
        return <LandPlot className="h-5 w-5 text-indigo-500" />;
      default:
        return null;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
        <LayoutGrid className="h-6 w-6 text-primary" /> Catálogo de Ativos Disponíveis
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {catalogAssets?.map((asset, index) => (
          <div key={index} className="bg-card text-card-foreground rounded-lg shadow-md p-4 border border-border flex flex-col justify-between transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">{asset.name}</h2>
                {getAssetIcon(asset.tipo)}
              </div>
              <p className="text-sm text-muted-foreground mb-1">Tipo: <span className="font-medium text-foreground">{asset.tipo}</span></p>
            </div>
            <div className="mt-4">
              <p className="text-xl font-bold text-primary">{formatterForReal.format(asset.value)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}