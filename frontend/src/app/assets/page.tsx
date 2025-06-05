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
import { fetchAllAssets, fetchClientAssets, createAsset, deleteAsset, Asset, CreateAssetPayload } from '@/api/assets';
import { fetchClientsForFilter, Client } from '@/api/clients';


// --- Dados mocados 
const MOCKED_CATALOG_NAMES = [
  "PETR4", "VALE3", "ITUB4", "Tesouro IPCA+ 2035", "Tesouro Selic 2027",
  "CDB Banco Inter (1 ano)", "LCI Caixa (2 anos)", "USD/BRL", "EUR/BRL",
  "Bitcoin", "Ethereum", "Ouro (g)", "Soja (saca 60kg)", "Milho (saca 60kg)",
  "Café Arábica (saca 60kg)"
];

const addAssetFormSchema = z.object({
  name: z.string().min(1, { message: "Selecione o nome do ativo." }),
  value: z.preprocess(
    (val) => Number(val),
    z.number({ invalid_type_error: "Valor deve ser um número." }).positive({ message: "Valor deve ser um número positivo." })
  ),
  clientId: z.string().uuid({ message: "Selecione um cliente válido." }), 
});

type AddAssetFormValues = z.infer<typeof addAssetFormSchema>;

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

  const createAssetMutation = useMutation({
    mutationFn: createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setIsAddAssetDialogOpen(false);
      addAssetForm.reset();
      setAddAssetError(null);
    },
    onError: (err: AxiosError<{ erro: string }>) => {
      console.error("Erro ao criar ativo:", err);
      if (err.response && err.response.data && err.response.data.erro) {
        if (err.response.data.erro === "Cliente está inativo, caso queira prosseguir terá que ativar.") {
          setAddAssetError("Este cliente está inativo. Ative-o para adicionar ativos");
        } else {
          setAddAssetError(`Erro: ${err.response.data.erro}`);
        }
      } else {
        setAddAssetError("Ocorreu um erro ao adicionar o ativo.");
      }
    }
  });

  const deleteAssetMutation = useMutation({
    mutationFn: deleteAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      if (selectedClientId !== null) {
         queryClient.invalidateQueries({ queryKey: ['assets', 'client', selectedClientId] });
      }
    },
    onError: (err) => {
      console.error("Erro ao apagar ativo:", err);
    }
  });

  const addAssetForm = useForm<AddAssetFormValues>({
    resolver: zodResolver(addAssetFormSchema),
    defaultValues: {
      name: "", 
      value: 0,
      clientId: undefined,
    },
  });

  const handleOpenAddAssetDialog = () => {
    setIsAddAssetDialogOpen(true);
    setAddAssetError(null); 
    addAssetForm.reset({ name: "", value: 0, clientId: undefined });
  };

  const handleCloseAddAssetDialog = () => {
    setIsAddAssetDialogOpen(false);
    setAddAssetError(null); 
    addAssetForm.reset();
  };

  const onAddAssetSubmit = (values: AddAssetFormValues) => {
    if (!values.name) {
      setAddAssetError("O nome do asset é obrigatório");
      return;
    }
  
    console.log("Submitting values:", values);
    setAddAssetError(null);
    createAssetMutation.mutate(values as CreateAssetPayload);
  };

  const handleDeleteAsset = (assetId: string) => { 
    if (confirm("Tem certeza que deseja apagar este ativo?")) {
      deleteAssetMutation.mutate(assetId);
    }
  };

  const assetsToDisplay = selectedClientId !== null ? clientAssets : allAssets;
  const isLoading = selectedClientId !== null ? isLoadingClient : isLoadingAll;
  const error = selectedClientId !== null ? errorClient : errorAll;

  if (isLoadingClients) return <div>Carregando clientes para filtro...</div>;
  if (errorClients) return <div>Erro ao carregar clientes para filtro: {(errorClients as Error).message}</div>;
  if (isLoading) return <div>Carregando ativos...</div>;
  if (error) return <div>Ocorreu um erro ao carregar ativos: {(error as Error).message}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Ativos</h1>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="client-filter" className="text-sm font-medium">Filtrar por Cliente:</label>
          <Select onValueChange={(value) => setSelectedClientId(value === 'all' ? null : value)} value={selectedClientId === null ? 'all' : selectedClientId}>
            <SelectTrigger id="client-filter" className="w-[180px]">
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
          {assetsToDisplay?.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell>{asset.name}</TableCell>
              <TableCell>{asset.value.toFixed(2)}</TableCell>
              <TableCell>{asset.clientId ? (clients?.find(c => c.id === asset.clientId)?.name || 'Cliente Desconhecido') : 'Ativo Fixo'}</TableCell>
              <TableCell className="text-right">
                 <Button variant="ghost" size="sm" onClick={() => handleDeleteAsset(asset.id)}>Apagar</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isAddAssetDialogOpen} onOpenChange={setIsAddAssetDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Ativo</DialogTitle>
          </DialogHeader>
          <Form {...addAssetForm}>
            <form onSubmit={addAssetForm.handleSubmit(onAddAssetSubmit)} className="grid gap-4 py-4">
              <FormField
                control={addAssetForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Ativo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um ativo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MOCKED_CATALOG_NAMES.map((name) => (
                          <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      <Input type="number" step="0.01" {...field} onChange={event => field.onChange(event.target.valueAsNumber)} />
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients?.map(client => (
                          <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem> 
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {addAssetError && (
                <div className="text-sm font-medium text-destructive">{addAssetError}</div>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseAddAssetDialog}>Cancelar</Button>
                <Button type="submit" disabled={addAssetForm.formState.isSubmitting || createAssetMutation.isPending}>
                  Adicionar Ativo
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}