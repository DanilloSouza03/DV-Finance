'use client';

import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchCatalogAssets, CatalogAsset } from '@/api/assets';

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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Catálogo de Ativos</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {catalogAssets?.map((asset, index) => (
            <TableRow key={index}>
              <TableCell>{asset.name}</TableCell>
              <TableCell>{asset.tipo}</TableCell>
              <TableCell>{formatterForReal.format(asset.value)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}