"use client";

import type React from "react";
import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Phone,
  MapPin,
  Edit2,
  Trash2,
  User,
  CreditCard,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ConfirmationModal } from "@/components/confirmation-modal";

import { mockClients } from "@/lib/mock-data";
import { type Client, generateClientId, searchClients } from "@/lib/data";
import { formatCpfCnpj, formatPhone } from "@/lib/formatters";
import { validateClientForm, type ValidationErrors } from "@/lib/validators";

const ITEMS_PER_PAGE = 10;

export function ClientesContent() {
  // State: Data & UI
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // State: Modals & Editing
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // State: Form
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    cpf: "",
    address: "",
    notes: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  // State: Confirmations
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    clientId: string | null;
  }>({
    open: false,
    clientId: null,
  });
  const [editConfirmation, setEditConfirmation] = useState(false);

  // Derived State
  const filteredClients = useMemo(
    () => searchClients(clients, search),
    [clients, search],
  );
  const displayedClients = filteredClients.slice(0, visibleCount);
  const hasMoreClients = filteredClients.length > visibleCount;

  // Handlers: Search & content
  const handleLoadMore = () => setVisibleCount((prev) => prev + ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  // Handlers: Form Lifecycle
  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      cpf: "",
      address: "",
      notes: "",
    });
    setEditingClient(null);
    setIsDialogOpen(false);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { isValid, errors: newErrors } = validateClientForm(formData);
    setErrors(newErrors);

    if (!isValid) return;

    if (editingClient) {
      setEditConfirmation(true);
    } else {
      saveClient();
    }
  };

  const saveClient = () => {
    if (editingClient) {
      setClients(
        clients.map((c) =>
          c.id === editingClient.id ? { ...c, ...formData } : c,
        ),
      );
    } else {
      const newClient: Client = {
        id: generateClientId(),
        ...formData,
        createdAt: new Date(),
      };
      setClients([...clients, newClient]);
    }
    resetForm();
  };

  // Handlers: Actions
  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email,
      cpf: client.cpf,
      address: client.address,
      notes: client.notes || "",
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) =>
    setDeleteConfirmation({ open: true, clientId: id });

  const handleConfirmDelete = () => {
    if (deleteConfirmation.clientId) {
      setClients(clients.filter((c) => c.id !== deleteConfirmation.clientId));
    }
    setDeleteConfirmation({ open: false, clientId: null });
  };

  const handleConfirmEdit = () => {
    saveClient();
    setEditConfirmation(false);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div className="pl-12 lg:pl-0">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            Clientes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie sua base de clientes ({filteredClients.length}{" "}
            {filteredClients.length === 1 ? "cliente" : "clientes"})
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border mx-4 sm:mx-auto max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editingClient ? "Editar Cliente" : "Novo Cliente"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {editingClient && (
                <div className="p-3 rounded-md bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground">
                    ID do Cliente (imutável)
                  </p>
                  <p className="font-mono font-semibold text-foreground">
                    {editingClient.id}
                  </p>
                </div>
              )}

              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="Nome do cliente"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              {/* CPF */}
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF / CNPJ *</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      cpf: formatCpfCnpj(e.target.value),
                    });
                    if (errors.cpf) setErrors({ ...errors, cpf: undefined });
                  }}
                  maxLength={18}
                  className={errors.cpf ? "border-destructive" : ""}
                />
                {errors.cpf && (
                  <p className="text-xs text-destructive">{errors.cpf}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email)
                      setErrors({ ...errors, email: undefined });
                  }}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      phone: formatPhone(e.target.value),
                    });
                    if (errors.phone)
                      setErrors({ ...errors, phone: undefined });
                  }}
                  maxLength={15}
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone}</p>
                )}
              </div>

              {/* Endereço */}
              <div className="space-y-2">
                <Label htmlFor="address">Endereço *</Label>
                <Input
                  id="address"
                  placeholder="Endereço completo"
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    if (errors.address)
                      setErrors({ ...errors, address: undefined });
                  }}
                  className={errors.address ? "border-destructive" : ""}
                />
                {errors.address && (
                  <p className="text-xs text-destructive">{errors.address}</p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Observações sobre o cliente"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1 bg-transparent"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {editingClient ? "Salvar" : "Cadastrar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, ID, CPF, email, telefone ou endereço..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        {displayedClients.map((client) => (
          <div
            key={client.id}
            className="p-3 md:p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center justify-between gap-4">
              {/* Client info - compact layout */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-foreground truncate">
                      {client.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className="font-mono text-xs shrink-0"
                    >
                      #{client.id}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      {client.cpf}
                    </span>
                    <span className="items-center gap-1 hidden sm:flex">
                      <Phone className="h-3 w-3" />
                      {client.phone}
                    </span>
                    <span className="items-center gap-1 hidden md:flex">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate max-w-[200px]">
                        {client.address}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions - compact */}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleEdit(client)}
                  title="Editar cliente"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeleteClick(client.id)}
                  title="Excluir cliente"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {filteredClients.length === 0 && (
          <div className="text-center py-12 rounded-lg border border-border bg-card">
            <User className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Nenhum cliente encontrado</p>
          </div>
        )}
      </div>

      {hasMoreClients && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            className="bg-transparent"
          >
            <ChevronDown className="h-4 w-4 mr-2" />
            Carregar mais ({filteredClients.length - visibleCount} restantes)
          </Button>
        </div>
      )}

      {filteredClients.length > 0 && (
        <div className="mt-4 text-center text-xs text-muted-foreground">
          Exibindo {displayedClients.length} de {filteredClients.length}{" "}
          clientes
        </div>
      )}

      <ConfirmationModal
        open={deleteConfirmation.open}
        onOpenChange={(open) =>
          setDeleteConfirmation({ ...deleteConfirmation, open })
        }
        title="Excluir cliente"
        description="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita e todos os dados do cliente serão perdidos permanentemente."
        confirmText="Excluir cliente"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />

      <ConfirmationModal
        open={editConfirmation}
        onOpenChange={setEditConfirmation}
        title="Confirmar alterações"
        description="Tem certeza que deseja salvar as alterações nos dados deste cliente?"
        confirmText="Salvar alterações"
        onConfirm={handleConfirmEdit}
      />
    </div>
  );
}
