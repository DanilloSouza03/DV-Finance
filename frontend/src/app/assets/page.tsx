'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios'; 
import { fetchAllAssets, fetchClientAssets, createAsset, deleteAsset, Asset, CreateAssetPayload, fetchCatalogAssets, CatalogAsset } from '@/api/assets';
import { fetchClientsForFilter, Client } from '@/api/clients';
import { Trash2, TrendingUp, DollarSign, Bitcoin, Leaf, Banknote, LandPlot } from 'lucide-react';


const getAssetIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'ação': return <TrendingUp className="h-4 w-4 text-blue-500" />;
    case 'moeda': return <DollarSign className="h-4 w-4 text-green-500" />;
    case 'cripto': return <Bitcoin className="h-4 w-4 text-yellow-500" />;
    case 'commodity': return <Leaf className="h-4 w-4 text-amber-700" />;
    case 'título privado': return <Banknote className="h-4 w-4 text-purple-500" />;
    case 'título público': return <LandPlot className="h-4 w-4 text-indigo-500" />;
    default: return null;
  }
};

const addAssetFormSchema = z.object({
  name: z.string().min(1, { message: "Selecione o nome do ativo." }),
  value: z.preprocess(
    (val) => Number(val),
    z.number({ invalid_type_error: "Valor deve ser um número." }).positive({ message: "Valor deve ser um número positivo." })
  ),
  clientId: z.string().uuid({ message: "Selecione um cliente válido." }),
});

type AddAssetFormValues = z.infer<typeof addAssetFormSchema>;

const formatterForReal = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function AssetsPage() {
  const queryClient = useQueryClient();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isAddAssetDialogOpen, setIsAddAssetDialogOpen] = useState(false);
  const [addAssetError, setAddAssetError] = useState<string | null>(null);

  const { data: allAssets, isLoading: isLoadingAll, error: errorAll } = useQuery<Asset[]>({
    queryKey: ['assets', 'all'],
    queryFn: fetchAllAssets,
    enabled: selectedClientId === null,
  });

  const { data: clientAssets, isLoading: isLoadingClient, error: errorClient } = useQuery<Asset[]>({
    queryKey: ['assets', 'client', selectedClientId],
    queryFn: () => fetchClientAssets(selectedClientId!),
    enabled: selectedClientId !== null,
  });

  const { data: clients, isLoading: isLoadingClients, error: errorClients } = useQuery<Client[]>({
    queryKey: ['clients-filter'],
    queryFn: fetchClientsForFilter,
  });

  const { data: catalogAssets, isLoading: isLoadingCatalog, error: errorCatalog } = useQuery<CatalogAsset[]>({
    queryKey: ['assets-catalog'],
    queryFn: fetchCatalogAssets,
  });

  const createAssetMutation = useMutation({
    mutationFn: createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setIsAddAssetDialogOpen(false);
      addAssetForm.reset();
      setAddAssetError(null);
    },
    onError: (err: AxiosError<{ error: string }>) => {
      console.error("Erro ao criar ativo:", err);
      setAddAssetError(err.response?.data?.error || "Erro desconhecido ao criar ativo.");
    }
  });

  const deleteAssetMutation = useMutation({
    mutationFn: deleteAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      if (selectedClientId) {
        queryClient.invalidateQueries({ queryKey: ['assets', 'client', selectedClientId] });
      }
    },
    onError: (err: AxiosError<{ error: string }>) => {
      console.error("Erro ao apagar ativo:", err);
      alert(err.response?.data?.error || "Erro desconhecido ao apagar ativo.");
    }
  });

  const addAssetForm = useForm<AddAssetFormValues>({
    resolver: zodResolver(addAssetFormSchema),
    defaultValues: {
      name: undefined,
      value: 0,
      clientId: undefined,
    },
  });

  const handleOpenAddAssetDialog = () => {
    setIsAddAssetDialogOpen(true);
    setAddAssetError(null);
    addAssetForm.reset({ name: undefined, value: 0, clientId: undefined });
  };

  const handleCloseAddAssetDialog = () => {
    setIsAddAssetDialogOpen(false);
    setAddAssetError(null);
    addAssetForm.reset();
  };

  const onAddAssetSubmit = (values: AddAssetFormValues) => {
    setAddAssetError(null);
    createAssetMutation.mutate(values as CreateAssetPayload);
  };

  const handleDeleteAsset = (id: string) => {
    if (confirm("Deseja mesmo apagar este ativo?")) {
      deleteAssetMutation.mutate(id);
    }
  };

  const assetsToDisplay = selectedClientId ? clientAssets : allAssets;
  const isLoading = selectedClientId ? isLoadingClient : isLoadingAll;
  const error = selectedClientId ? errorClient : errorAll;

  if (isLoadingClients || isLoadingCatalog) return <div>Carregando dados...</div>;
  if (errorClients) return <div>Erro ao carregar clientes: {(errorClients as Error).message}</div>;
  if (errorCatalog) return <div>Erro ao carregar catálogo: {(errorCatalog as Error).message}</div>;
  if (isLoading) return <div>Carregando ativos...</div>;
  if (error) return <div>Erro ao carregar ativos: {(error as Error).message}</div>;

  const assetTypeMap = new Map<string, string>();
  catalogAssets?.forEach(a => assetTypeMap.set(a.name, a.tipo));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-4">Ativos</h1>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <label htmlFor="client-filter" className="text-sm font-medium shrink-0">Filtrar por Cliente:</label>
          <Select
            onValueChange={(value) => setSelectedClientId(value === 'all' ? null : value)}
            value={selectedClientId ?? 'all'}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Todos os Ativos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Ativos</SelectItem>
              {clients?.map(client => (
                <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleOpenAddAssetDialog}>Adicionar Ativo</Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assetsToDisplay?.map((asset) => {
              const icon = getAssetIcon(assetTypeMap.get(asset.name) ?? 'desconhecido');
              const clientName = clients?.find(c => c.id === asset.clientId)?.name ?? 'Ativo Fixo';
              return (
                <TableRow key={asset.id}>
                  <TableCell className="flex items-center gap-2">
                    {asset.name} {icon}
                  </TableCell>
                  <TableCell>{formatterForReal.format(asset.value)}</TableCell>
                  <TableCell>{clientName}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteAsset(asset.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddAssetDialogOpen} onOpenChange={setIsAddAssetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Ativo</DialogTitle>
          </DialogHeader>

          <Form {...addAssetForm}>
            <form onSubmit={addAssetForm.handleSubmit(onAddAssetSubmit)} className="space-y-4">
              <FormField
                control={addAssetForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um ativo" />
                        </SelectTrigger>
                        <SelectContent>
                          {catalogAssets?.map(a => (
                            <SelectItem key={a.name} value={a.name}>{a.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addAssetForm.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addAssetForm.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients?.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {addAssetError && (
                <p className="text-sm text-red-600">{addAssetError}</p>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={handleCloseAddAssetDialog}>Cancelar</Button>
                <Button type="submit">Adicionar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}