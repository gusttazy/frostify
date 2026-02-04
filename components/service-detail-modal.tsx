"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  User,
  Phone,
  MapPin,
  Clock,
  FileText,
  Save,
  Edit2,
  CreditCard,
  Package,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { mockClients } from "@/lib/mock-data";
import {
  type Service,
  type ServiceStatus,
  getStatusLabel,
  serviceTypes,
} from "@/lib/data";
import { cn } from "@/lib/utils";

interface ServiceDetailModalProps {
  service: Service | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (service: Service) => void;
  mode: "view" | "edit";
  onModeChange: (mode: "view" | "edit") => void;
}

/**
 * Modal de detalhes e edição de ordem de serviço
 *
 * Modos:
 * - view: Visualização somente leitura
 * - edit: Permite editar tipo, descrição, horário e status
 *
 * Features:
 * - Informações do cliente integradas
 * - Timeline de execução (início/fim)
 * - Validação de formulário
 * - Confirmação antes de salvar
 * - Sistema de notas/histórico
 */
export function ServiceDetailModal({
  service,
  open,
  onOpenChange,
  onUpdate,
  mode,
  onModeChange,
}: ServiceDetailModalProps) {
  // ============================================
  // ESTADO: Formulário
  // ============================================

  const [status, setStatus] = useState<ServiceStatus>("aguardando");
  const [notes, setNotes] = useState("");
  const [description, setDescription] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  // ============================================
  // ESTADO: UX e Validação
  // ============================================

  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState<{
    serviceType?: string;
    description?: string;
    scheduledTime?: string;
  }>({});

  // ============================================
  // DADOS DERIVADOS
  // ============================================

  const client = service
    ? mockClients.find((c) => c.id === service.clientId)
    : null;
  const isCompleted = service?.status === "concluido";

  // Inicializa formulário quando serviço muda
  useEffect(() => {
    if (service) {
      setStatus(service.status);
      setDescription(service.description);
      setServiceType(service.type);
      setScheduledTime(service.scheduledTime || "");
      setNotes("");
      setHasChanges(false);
      setErrors({});
    }
  }, [service]);

  // ============================================
  // VALIDAÇÃO
  // ============================================

  const validateForm = (): boolean => {
    const newErrors: {
      serviceType?: string;
      description?: string;
      scheduledTime?: string;
    } = {};

    if (!serviceType.trim()) {
      newErrors.serviceType = "Tipo de serviço é obrigatório";
    }

    if (!description.trim()) {
      newErrors.description = "Descrição é obrigatória";
    }

    // Validação de formato de horário (HH:mm)
    if (
      scheduledTime &&
      !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(scheduledTime)
    ) {
      newErrors.scheduledTime = "Horário inválido (HH:mm)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // HANDLERS
  // ============================================

  const handleSaveClick = () => {
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmSave = () => {
    if (service) {
      // Adiciona nota ao histórico se existir
      const updatedDescription = notes
        ? `${description}\n\n📝 ${new Date().toLocaleDateString("pt-BR")}: ${notes}`
        : description;

      let updatedByLogic = { ...service };

      // Aplica lógica de timestamps se status mudou
      if (status !== service.status) {
        if (status === "em_andamento" && !service.actualStartTime) {
          updatedByLogic.actualStartTime = new Date();
        }
        if (status === "concluido" && !service.actualEndTime) {
          updatedByLogic.actualEndTime = new Date();
        }
      }

      onUpdate({
        ...updatedByLogic,
        status,
        description: updatedDescription,
        type: serviceType,
        scheduledTime,
      });

      setNotes("");
      setHasChanges(false);
      onModeChange("view");
    }
    setShowConfirmation(false);
  };

  const handleCancel = () => {
    if (mode === "edit") {
      // Reseta para valores originais
      if (service) {
        setStatus(service.status);
        setDescription(service.description);
        setServiceType(service.type);
        setScheduledTime(service.scheduledTime || "");
        setNotes("");
        setHasChanges(false);
        setErrors({});
      }
      onModeChange("view");
    } else {
      onOpenChange(false);
    }
  };

  if (!service) return null;

  const formattedDate = service.date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Mapeamento de cores de status para usar variáveis CSS
  const statusColorMap = {
    aguardando:
      "bg-[var(--status-waiting-bg)] text-[var(--status-waiting)] border-[var(--status-waiting-border)]",
    em_andamento:
      "bg-[var(--status-progress-bg)] text-[var(--status-progress)] border-[var(--status-progress-border)]",
    concluido:
      "bg-[var(--status-completed-bg)] text-[var(--status-completed)] border-[var(--status-completed-border)]",
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card border-border max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          {/* ============================================ */}
          {/* HEADER - Título, ID e Status */}
          {/* ============================================ */}
          <DialogHeader className="sticky top-0 z-10 p-4 sm:p-6 border-b border-border bg-linear-to-b from-card to-card/95 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <DialogTitle className="text-lg sm:text-xl font-bold">
                    {mode === "edit" ? "Editar OS" : "Detalhes da OS"}
                  </DialogTitle>
                  <Badge
                    variant="outline"
                    className="font-mono text-xs bg-secondary/50"
                  >
                    {service.id}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  <span className="font-medium">{service.clientName}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium border",
                    statusColorMap[service.status],
                  )}
                >
                  {getStatusLabel(service.status)}
                </Badge>
                {mode === "view" && !isCompleted && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onModeChange("edit")}
                    className="h-8"
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* ============================================ */}
          {/* CONTEÚDO PRINCIPAL */}
          {/* ============================================ */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* Informações do Cliente e Agendamento */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Card: Cliente */}
              <div className="rounded-lg border border-border bg-secondary/20 p-4 space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                      {service.clientName}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      ID: {service.clientId}
                    </p>
                  </div>
                </div>

                {client && (
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    {client.cpf && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CreditCard className="h-3.5 w-3.5 shrink-0" />
                        <span>{client.cpf}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span className="leading-tight">{client.address}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card: Agendamento */}
              <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Agendamento</h3>
                </div>

                <div className="space-y-3">
                  {/* Data */}
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Data do Serviço
                    </Label>
                    <p className="text-sm font-medium mt-1">{formattedDate}</p>
                  </div>

                  {/* Horário */}
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Horário Agendado
                    </Label>
                    {mode === "view" ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {service.scheduledTime || "Não definido"}
                        </span>
                      </div>
                    ) : (
                      <Input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => {
                          setScheduledTime(e.target.value);
                          setHasChanges(true);
                          if (errors.scheduledTime)
                            setErrors({ ...errors, scheduledTime: undefined });
                        }}
                        className={cn(
                          "mt-1",
                          errors.scheduledTime && "border-destructive",
                        )}
                      />
                    )}
                    {errors.scheduledTime && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.scheduledTime}
                      </p>
                    )}
                  </div>

                  {/* Status (apenas em modo edit) */}
                  {mode === "edit" && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Status do Serviço
                      </Label>
                      <Select
                        value={status}
                        onValueChange={(v) => {
                          setStatus(v as ServiceStatus);
                          setHasChanges(true);
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aguardando">Aguardando</SelectItem>
                          <SelectItem value="em_andamento">
                            Em Andamento
                          </SelectItem>
                          <SelectItem value="concluido">Concluído</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Detalhes do Serviço */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Detalhes do Serviço</h3>
              </div>

              {mode === "view" ? (
                /* Modo Visualização */
                <div className="rounded-lg border border-border bg-secondary/10 p-4 space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Tipo de Serviço
                    </Label>
                    <p className="text-sm font-medium mt-1">{service.type}</p>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      Descrição
                    </Label>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                      {service.description}
                    </div>
                  </div>
                </div>
              ) : (
                /* Modo Edição */
                <div className="rounded-lg border border-border bg-card p-4 space-y-4">
                  {/* Tipo de Serviço */}
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">Tipo de Serviço *</Label>
                    <Select
                      value={serviceType}
                      onValueChange={(v) => {
                        setServiceType(v);
                        setHasChanges(true);
                        if (errors.serviceType)
                          setErrors({ ...errors, serviceType: undefined });
                      }}
                    >
                      <SelectTrigger
                        id="serviceType"
                        className={cn(
                          errors.serviceType && "border-destructive",
                        )}
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
                    {errors.serviceType && (
                      <p className="text-xs text-destructive">
                        {errors.serviceType}
                      </p>
                    )}
                  </div>

                  {/* Descrição */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição do Serviço *</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        setHasChanges(true);
                        if (errors.description)
                          setErrors({ ...errors, description: undefined });
                      }}
                      rows={5}
                      placeholder="Descreva os detalhes do serviço..."
                      className={cn(
                        "leading-relaxed resize-none",
                        errors.description && "border-destructive",
                      )}
                    />
                    {errors.description && (
                      <p className="text-xs text-destructive">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Adicionar Nota */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <Label
                        htmlFor="notes"
                        className="text-primary font-medium"
                      >
                        Adicionar Nova Nota
                      </Label>
                    </div>
                    <Textarea
                      id="notes"
                      placeholder="Escreva uma atualização para adicionar ao histórico (opcional)"
                      value={notes}
                      onChange={(e) => {
                        setNotes(e.target.value);
                        setHasChanges(true);
                      }}
                      rows={3}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      A nota será adicionada com data e horário ao salvar
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline - Apenas se houver dados */}
            {(service.actualStartTime || service.actualEndTime) && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">Linha do Tempo</h3>
                  </div>

                  <div className="rounded-lg border border-border bg-secondary/10 p-4">
                    <div className="flex flex-col sm:flex-row gap-6">
                      {service.actualStartTime && (
                        <div className="flex items-start gap-3">
                          <div className="mt-1 h-3 w-3 rounded-full bg-status-progress shadow-[0_0_0_4px_var(--status-progress-bg)]" />
                          <div>
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                              Iniciado
                            </span>
                            <p className="font-medium text-sm mt-1">
                              {service.actualStartTime.toLocaleDateString(
                                "pt-BR",
                              )}
                              <span className="text-muted-foreground mx-1.5">
                                às
                              </span>
                              {service.actualStartTime.toLocaleTimeString(
                                "pt-BR",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                      {service.actualEndTime && (
                        <div className="flex items-start gap-3">
                          <div className="mt-1 h-3 w-3 rounded-full bg-status-completed shadow-[0_0_0_4px_var(--status-completed-bg)]" />
                          <div>
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                              Concluído
                            </span>
                            <p className="font-medium text-sm mt-1">
                              {service.actualEndTime.toLocaleDateString(
                                "pt-BR",
                              )}
                              <span className="text-muted-foreground mx-1.5">
                                às
                              </span>
                              {service.actualEndTime.toLocaleTimeString(
                                "pt-BR",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ============================================ */}
          {/* FOOTER - Botões de Ação */}
          {/* ============================================ */}
          <div className="sticky bottom-0 p-4 sm:p-6 border-t border-border bg-linear-to-t from-card to-card/95 backdrop-blur-sm flex flex-col-reverse sm:flex-row justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="w-full sm:w-auto"
            >
              {mode === "edit" ? "Cancelar" : "Fechar"}
            </Button>
            {mode === "edit" && (
              <Button
                onClick={handleSaveClick}
                disabled={!hasChanges}
                className="w-full sm:w-auto min-w-[160px]"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação */}
      <ConfirmationModal
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        title="Confirmar alterações"
        description="Tem certeza que deseja salvar as alterações? Isso pode atualizar o status e registrar horários de execução."
        confirmText="Salvar"
        onConfirm={handleConfirmSave}
      />
    </>
  );
}
