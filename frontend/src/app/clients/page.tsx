'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AxiosError } from 'axios'; 
import { fetchClients, createClient, updateClient, deleteClient, Client } from '@/api/clients';
import { Pencil, Trash2 } from 'lucide-react';

const clientFormSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres." }),
  email: z.string().email({ message: "Email inválido." }),
  active: z.boolean().default(false)
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const { data: clients, isLoading, error } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      active: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsDialogOpen(false);
      form.reset();
      setFormError(null); 
    },
    onError: (err: AxiosError<{ error: string, details?: any }>) => {
      console.error("Erro ao criar cliente:", err);
      if (err.response && err.response.data && err.response.data.error) {
        setFormError(`Erro: ${err.response.data.error}`);
      } else {
        setFormError("Ocorreu um erro ao cadastrar o cliente.");
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsDialogOpen(false);
      form.reset();
      setEditingClient(null);
      setFormError(null); 
    },
     onError: (err: AxiosError<{ error: string, details?: any }>) => {
      console.error("Erro ao atualizar cliente:", err);
       if (err.response && err.response.data && err.response.data.error) {
        setFormError(`Erro: ${err.response.data.error}`);
      } else {
        setFormError("Ocorreu um erro ao atualizar o cliente.");
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
     onError: (err: AxiosError<{ error: string }>) => {
      console.error("Erro ao apagar cliente:", err);
       if (err.response && err.response.data && err.response.data.error) {
        alert(`Erro ao apagar cliente: ${err.response.data.error}`);
      } else {
        alert("Ocorreu um erro ao apagar o cliente.");
      }
    }
  });

  const handleOpenDialog = (client?: Client) => {
    setFormError(null); 
    if (client) {
      setEditingClient(client);
      form.reset({ name: client.name, email: client.email, active: client.active });
    } else {
      setEditingClient(null);
      form.reset({ name: "", email: "", active: false });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingClient(null);
    form.reset();
    setFormError(null); 
  };

  const onSubmit = (values: ClientFormValues) => {
    setFormError(null); 
    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, ...values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleDelete = (clientId: string) => { 
    if (confirm("Tem certeza que deseja apagar este cliente?")) {
      deleteMutation.mutate(clientId);
    }
  };

  if (isLoading) return <div>Carregando clientes...</div>;
  if (error) return <div>Ocorreu um erro ao carregar clientes: {(error as Error).message}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">Clientes</h1>
      <Button onClick={() => handleOpenDialog()} className="mb-4">Adicionar Cliente</Button>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Nome</TableHead>
              <TableHead className="min-w-[200px]">Email</TableHead>
              <TableHead className="min-w-[100px]">Ativo</TableHead>
              <TableHead className="text-right min-w-[120px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients?.map((client) => (
              <TableRow key={client.id} className="hover:bg-muted/50 transition-colors">
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    client.active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    <span className={`w-2 h-2 rounded-full mr-1 ${client.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {client.active ? 'Ativo' : 'Inativo'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(client)} title="Editar">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)} title="Apagar">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[90%] max-w-md sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingClient ? 'Editar Cliente' : 'Adicionar Cliente'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormLabel>Ativo?</FormLabel>
                    <FormControl>
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {formError && (
                <div className="text-sm font-medium text-destructive">{formError}</div>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
                <Button type="submit" disabled={form.formState.isSubmitting || createMutation.isPending || updateMutation.isPending}>
                  {editingClient ? 'Salvar Alterações' : 'Adicionar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}