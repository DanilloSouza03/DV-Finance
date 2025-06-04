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
    onError: (err: AxiosError) => { 
      console.error("Erro ao criar cliente:", err);
      setFormError("Ocorreu um erro ao cadastrar o cliente! Verifique se este e-mail já não está sendo usado.");
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
     onError: (err: AxiosError) => { 
      console.error("Erro ao atualizar cliente:", err);
      setFormError("Ocorreu um erro ao atualizar o cliente.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
     onError: (err) => {
      console.error("Erro ao apagar cliente:", err);
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

  const handleDelete = (clientId: Number) => {
    if (confirm("Tem certeza que deseja apagar este cliente?")) {
      deleteMutation.mutate(clientId);
    }
  };

  if (isLoading) return <div>Carregando clientes...</div>;
  if (error) return <div>Ocorreu um erro ao carregar clientes: {(error as Error).message}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Clientes</h1>
      <Button onClick={() => handleOpenDialog()} className="mb-4">Adicionar Cliente</Button>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients?.map((client) => (
            <TableRow key={client.id}>
              <TableCell>{client.name}</TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>{client.active ? 'Sim' : 'Não'}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(client)}>Editar</Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(client.id)}>Apagar</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
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