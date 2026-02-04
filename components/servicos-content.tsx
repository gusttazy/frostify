"use client";

import type React from "react";

import { useState, useMemo } from "react";
import { Plus, Search, Calendar, Filter, ChevronDown } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ServiceCard } from "@/components/service-card";
import { ServiceDetailModal } from "@/components/service-detail-modal";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { mockServices, mockClients } from "@/lib/mock-data";
import {
  serviceTypes,
  type Service,
  type ServiceStatus,
  type Client,
  getStatusColor,
  generateServiceId,
} from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { ClientSearchInput } from "@/components/client-search-input";

interface ServicosContentProps {
  initialFilter?: "aguardando" | "em_andamento" | "concluido" | "all";
}

const ITEMS_PER_PAGE = 12;

export function ServicosContent({ initialFilter }: ServicosContentProps) {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [clients] = useState<Client[]>(mockClients);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | "all">(
    initialFilter || "concluido",
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    type: "",
    description: "",
    date: "",
    status: "aguardando" as ServiceStatus,
  });
  const [errors, setErrors] = useState<{
    type?: string;
    description?: string;
    date?: string;
    client?: string;
  }>({});

  const [selectedServiceIndex, setSelectedServiceIndex] = useState<
    number | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");

  const [confirmStatusChange, setConfirmStatusChange] = useState<{
    open: boolean;
    index: number | null;
    newStatus: ServiceStatus | null;
  }>({ open: false, index: null, newStatus: null });

  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const client = clients.find((c) => c.id === service.clientId);
      const normalizedSearch = search.toLowerCase().trim();
      const searchWithoutMask = search.replace(/\D/g, "");

      const matchesSearch =
        service.clientName.toLowerCase().includes(normalizedSearch) ||
        service.type.toLowerCase().includes(normalizedSearch) ||
        service.description.toLowerCase().includes(normalizedSearch) ||
        service.clientId.toLowerCase().includes(normalizedSearch) ||
        service.id.toLowerCase().includes(normalizedSearch) ||
        (client?.cpf.replace(/\D/g, "").includes(searchWithoutMask) &&
          searchWithoutMask.length > 0);

      const matchesStatus =
        statusFilter === "all" || service.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [services, clients, search, statusFilter]);

  const displayedServices = filteredServices.slice(0, visibleCount);
  const hasMoreServices = filteredServices.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleFilterChange = (value: ServiceStatus | "all") => {
    setStatusFilter(value);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const validateForm = (): boolean => {
    const newErrors: {
      type?: string;
      description?: string;
      date?: string;
      client?: string;
    } = {};

    if (!selectedClient) {
      newErrors.client = "Selecione um cliente";
    }

    if (!formData.type) {
      newErrors.type = "Selecione o tipo de serviço";
    }

    if (!formData.date) {
      newErrors.date = "Data é obrigatória";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = "Data não pode ser no passado";
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Descrição deve ter pelo menos 10 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const newService: Service = {
      id: generateServiceId(),
      clientId: selectedClient!.id,
      clientName: selectedClient!.name,
      type: formData.type,
      description: formData.description,
      date: new Date(formData.date),
      status: formData.status,
      createdAt: new Date(),
    };
    setServices([...services, newService]);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: "",
      description: "",
      date: "",
      status: "aguardando",
    });
    setSelectedClient(null);
    setIsDialogOpen(false);
    setErrors({});
  };

  const handleDoubleClick = (index: number) => {
    setSelectedServiceIndex(index);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleViewDetails = (index: number) => {
    setSelectedServiceIndex(index);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEditService = (index: number) => {
    if (services[index].status !== "concluido") {
      setSelectedServiceIndex(index);
      setModalMode("edit");
      setIsModalOpen(true);
    }
  };

  const handleUpdateService = (updatedService: Service) => {
    if (selectedServiceIndex !== null) {
      const newServices = [...services];
      newServices[selectedServiceIndex] = updatedService;
      setServices(newServices);
    }
  };

  const handleStatusChangeRequest = (
    index: number,
    newStatus: ServiceStatus,
  ) => {
    if (newStatus === "concluido") {
      setConfirmStatusChange({ open: true, index, newStatus });
    } else {
      handleStatusChange(index, newStatus);
    }
  };

  const handleStatusChange = (index: number, newStatus: ServiceStatus) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], status: newStatus };
    setServices(newServices);
  };

  const handleConfirmStatusChange = () => {
    if (confirmStatusChange.index !== null && confirmStatusChange.newStatus) {
      handleStatusChange(
        confirmStatusChange.index,
        confirmStatusChange.newStatus,
      );
    }
    setConfirmStatusChange({ open: false, index: null, newStatus: null });
  };

  const selectedService =
    selectedServiceIndex !== null ? services[selectedServiceIndex] : null;

  const statusOptions: { value: ServiceStatus | "all"; label: string }[] = [
    { value: "all", label: "Todos" },
    { value: "aguardando", label: "Aguardando" },
    { value: "em_andamento", label: "Em Andamento" },
    { value: "concluido", label: "Concluído" },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="pl-12 lg:pl-0">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            Serviços
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie ordens de serviço ({filteredServices.length}{" "}
            {filteredServices.length === 1 ? "serviço" : "serviços"})
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Nova Ordem de Serviço
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Cliente *</Label>
                <ClientSearchInput
                  clients={clients}
                  selectedClient={selectedClient}
                  onSelectClient={(client) => {
                    setSelectedClient(client);
                    if (errors.client)
                      setErrors({ ...errors, client: undefined });
                  }}
                />
                {errors.client && (
                  <p className="text-xs text-destructive">{errors.client}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Serviço *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => {
                    setFormData({ ...formData, type: value });
                    if (errors.type) setErrors({ ...errors, type: undefined });
                  }}
                >
                  <SelectTrigger
                    className={errors.type ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-xs text-destructive">{errors.type}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data do Serviço *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => {
                    setFormData({ ...formData, date: e.target.value });
                    if (errors.date) setErrors({ ...errors, date: undefined });
                  }}
                  className={errors.date ? "border-destructive" : ""}
                  min={new Date().toISOString().split("T")[0]}
                />
                {errors.date && (
                  <p className="text-xs text-destructive">{errors.date}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value as ServiceStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aguardando">Aguardando</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição Técnica *</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o serviço a ser realizado (mínimo 10 caracteres)"
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    if (errors.description)
                      setErrors({ ...errors, description: undefined });
                  }}
                  rows={3}
                  className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && (
                  <p className="text-xs text-destructive">
                    {errors.description}
                  </p>
                )}
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
                  Cadastrar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, CPF, ID do cliente ou OS..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-2 flex-wrap">
            {statusOptions.map((option) => (
              <Badge
                key={option.value}
                variant="outline"
                className={`cursor-pointer transition-colors ${
                  statusFilter === option.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : option.value !== "all"
                      ? getStatusColor(option.value as ServiceStatus)
                      : "bg-transparent"
                }`}
                onClick={() => handleFilterChange(option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedServices.map((service) => {
          const originalIndex = services.findIndex((s) => s.id === service.id);
          return (
            <ServiceCard
              key={service.id}
              service={service}
              index={originalIndex}
              onDoubleClick={() => handleDoubleClick(originalIndex)}
              onViewDetails={() => handleViewDetails(originalIndex)}
              onEditService={() => handleEditService(originalIndex)}
              onStatusChange={handleStatusChangeRequest}
            />
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum serviço encontrado</p>
        </div>
      )}

      {hasMoreServices && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            className="bg-transparent"
          >
            <ChevronDown className="h-4 w-4 mr-2" />
            Carregar mais ({filteredServices.length - visibleCount} restantes)
          </Button>
        </div>
      )}

      {filteredServices.length > 0 && (
        <div className="mt-4 text-center text-xs text-muted-foreground">
          Exibindo {displayedServices.length} de {filteredServices.length}{" "}
          serviços
        </div>
      )}

      <ServiceDetailModal
        service={selectedService}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onUpdate={handleUpdateService}
        mode={modalMode}
        onModeChange={setModalMode}
      />

      <ConfirmationModal
        open={confirmStatusChange.open}
        onOpenChange={(open) =>
          setConfirmStatusChange({ ...confirmStatusChange, open })
        }
        title="Concluir serviço"
        description="Tem certeza que deseja marcar este serviço como concluído? Após concluído, o serviço não poderá mais ser editado."
        confirmText="Concluir serviço"
        onConfirm={handleConfirmStatusChange}
      />
    </div>
  );
}
