"use client";

import {
  Calendar,
  Clock,
  MoreHorizontal,
  Eye,
  Edit2,
  ArrowRight,
  Lock,
  CircleDot,
  Play,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Service, ServiceStatus } from "@/lib/data";

/**
 * Props para o componente ServiceCard
 */
interface ServiceCardProps {
  /** Dados completos do serviço a ser exibido */
  service: Service;

  /** Índice do serviço no array (usado para callbacks) */
  index: number;

  /** Callback ao dar duplo clique no card */
  onDoubleClick?: () => void;

  /** Callback ao clicar em "Visualizar detalhes" no menu */
  onViewDetails?: () => void;

  /** Callback ao clicar em "Editar" no menu */
  onEditService?: () => void;

  /** Callback ao alterar status via menu dropdown */
  onStatusChange?: (index: number, newStatus: ServiceStatus) => void;
}

/**
 * Configuração visual para cada status de serviço
 * Mapeia status → ícone, label, classes CSS de borda e cor
 *
 * Usa variáveis CSS do tema Frostify (--status-waiting, --status-progress, --status-completed)
 */
const statusConfig = {
  aguardando: {
    icon: CircleDot,
    label: "Aguardando",
    borderClass: "border-l-[var(--status-waiting)]",
    iconClass: "text-[var(--status-waiting)]",
  },
  em_andamento: {
    icon: Play,
    label: "Em Andamento",
    borderClass: "border-l-[var(--status-progress)]",
    iconClass: "text-[var(--status-progress)]",
  },
  concluido: {
    icon: CheckCircle,
    label: "Concluído",
    borderClass: "border-l-[var(--status-completed)]",
    iconClass: "text-[var(--status-completed)]",
  },
};

/**
 * Card de serviço individual para o dashboard
 *
 * Funcionalidades:
 * - Exibe informações básicas do serviço (cliente, data, tipo)
 * - Indicador visual de status com borda colorida
 * - Duplo clique para abrir detalhes
 * - Menu dropdown com ações:
 *   - Visualizar detalhes
 *   - Editar (apenas se não concluído)
 *   - Alterar status (apenas se não concluído)
 * - Tooltip com horário agendado (se disponível)
 * - Visual hover com destaque
 *
 * @example
 * <ServiceCard
 *   service={serviceData}
 *   index={0}
 *   onDoubleClick={() => openModal(0)}
 *   onViewDetails={() => viewService(0)}
 *   onEditService={() => editService(0)}
 *   onStatusChange={(idx, status) => updateStatus(idx, status)}
 * />
 */
export function ServiceCard({
  service,
  index,
  onDoubleClick,
  onViewDetails,
  onEditService,
  onStatusChange,
}: ServiceCardProps) {
  // Formata data em português (ex: "15 jan")
  const formattedDate = service.date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });

  // Serviços concluídos não podem ser editados ou ter status alterado
  const isCompleted = service.status === "concluido";

  // Obtém configuração visual do status atual
  const config = statusConfig[service.status];
  const StatusIcon = config.icon;

  // Opções de status para o submenu de alteração
  const statusOptions: { value: ServiceStatus; label: string }[] = [
    { value: "aguardando", label: "Aguardando" },
    { value: "em_andamento", label: "Em Andamento" },
    { value: "concluido", label: "Concluído" },
  ];

  return (
    <Card
      className="bg-card border border-border hover:bg-secondary/30 transition-all cursor-pointer group border-l-2"
      style={{
        borderLeftColor: `var(--status-${service.status === "em_andamento" ? "progress" : service.status === "concluido" ? "completed" : "waiting"})`,
      }}
      onDoubleClick={onDoubleClick}
    >
      <CardContent className="p-3 md:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <StatusIcon
                      className="h-3.5 w-3.5 shrink-0"
                      style={{
                        color: `var(--status-${service.status === "em_andamento" ? "progress" : service.status === "concluido" ? "completed" : "waiting"})`,
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{config.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-xs font-mono text-muted-foreground">
                {service.id}
              </span>
              {isCompleted && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Lock className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Serviço concluído - somente consulta</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-sm font-medium text-foreground truncate mb-1">
              {service.clientName}
            </p>
            <p className="text-xs text-muted-foreground mb-1">{service.type}</p>
            <p className="text-xs text-muted-foreground/70 line-clamp-1">
              {service.description}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-card border-border w-48"
            >
              <DropdownMenuItem onClick={onViewDetails}>
                <Eye className="h-4 w-4 mr-2" />
                Visualizar detalhes
              </DropdownMenuItem>
              {!isCompleted && (
                <>
                  <DropdownMenuItem onClick={onEditService}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar serviço
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Alterar status
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="bg-card border-border">
                        {statusOptions.map((status) => (
                          <DropdownMenuItem
                            key={status.value}
                            onClick={() =>
                              onStatusChange?.(index, status.value)
                            }
                            disabled={service.status === status.value}
                          >
                            {status.label}
                            {service.status === status.value && (
                              <span className="ml-auto text-xs text-muted-foreground">
                                (atual)
                              </span>
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </>
              )}
              {isCompleted && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled className="text-muted-foreground">
                    <Lock className="h-4 w-4 mr-2" />
                    Serviço finalizado
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3 mt-3 pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            08:00
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
