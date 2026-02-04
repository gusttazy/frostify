"use client";

import { useState } from "react";
import {
  CheckCircle,
  CircleDot,
  Play,
  CalendarClock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { ServiceCard } from "@/components/service-card";
import { ServiceDetailModal } from "@/components/service-detail-modal";
import { StatsCard } from "@/components/stats-card";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockServices } from "@/lib/mock-data";
import { type Service, type ServiceStatus, isSameDay } from "@/lib/data";

/**
 * Componente principal do Dashboard
 *
 * Funcionalidades:
 * - Exibe cards de estatísticas (hoje, em andamento, agendados, concluídos)
 * - Organiza serviços em 3 colunas por status (Aguardando Hoje, Em Andamento, Concluído)
 * - Permite visualizar detalhes de serviços (duplo clique ou menu)
 * - Permite editar serviços em andamento ou aguardando
 * - Confirma mudança de status para "concluído"
 * - Exibe banner com link para serviços agendados em dias futuros
 */
export default function DashboardPage() {
  // ============================================
  // ESTADO: Dados e UI
  // ============================================

  /** Lista de todos os serviços (mock data que será substituído por API futuramente) */
  const [services, setServices] = useState<Service[]>(mockServices);

  /** Índice do serviço selecionado para visualização/edição (null = nenhum selecionado) */
  const [selectedServiceIndex, setSelectedServiceIndex] = useState<
    number | null
  >(null);

  /** Controla abertura/fechamento do modal de detalhes */
  const [isModalOpen, setIsModalOpen] = useState(false);

  /** Modo do modal: "view" (somente leitura) ou "edit" (permite edição) */
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");

  /** Estado do modal de confirmação de mudança de status para "concluído" */
  const [confirmStatusChange, setConfirmStatusChange] = useState<{
    open: boolean;
    index: number | null;
    newStatus: ServiceStatus | null;
  }>({ open: false, index: null, newStatus: null });

  // ============================================
  // FILTROS E AGRUPAMENTOS
  // ============================================

  /** Data de hoje (usada para filtrar serviços do dia) */
  const today = new Date();

  /**
   * Serviços aguardando para HOJE
   * Filtro: status "aguardando" E data igual a hoje
   * Mantém referência ao índice original para edição
   */
  const aguardandoHoje = services
    .map((s, i) => ({ service: s, index: i }))
    .filter(
      (item) =>
        item.service.status === "aguardando" &&
        isSameDay(item.service.date, today),
    );

  /**
   * Serviços agendados para DIAS FUTUROS
   * Filtro: status "aguardando" E data posterior a hoje (mas não hoje)
   * Usados no banner informativo no topo da página
   */
  const agendadosFuturos = services
    .map((s, i) => ({ service: s, index: i }))
    .filter(
      (item) =>
        item.service.status === "aguardando" &&
        item.service.date > today &&
        !isSameDay(item.service.date, today),
    );

  /**
   * Serviços em ANDAMENTO
   * Filtro: status "em_andamento" (independente da data)
   */
  const emAndamento = services
    .map((s, i) => ({ service: s, index: i }))
    .filter((item) => item.service.status === "em_andamento");

  /**
   * Serviços CONCLUÍDOS
   * Filtro: status "concluido" (independente da data)
   * Nota: serviços concluídos são somente leitura
   */
  const concluido = services
    .map((s, i) => ({ service: s, index: i }))
    .filter((item) => item.service.status === "concluido");

  /** Serviço atualmente selecionado (ou null se nenhum) */
  const selectedService =
    selectedServiceIndex !== null ? services[selectedServiceIndex] : null;

  // ============================================
  // HANDLERS: Navegação e Visualização
  // ============================================

  /**
   * Abre modal de detalhes ao dar duplo clique no card
   * @param index - Índice do serviço no array principal
   */
  const handleDoubleClick = (index: number) => {
    setSelectedServiceIndex(index);
    setModalMode("view");
    setIsModalOpen(true);
  };

  /**
   * Abre modal de detalhes ao clicar em "Visualizar detalhes" no menu
   * @param index - Índice do serviço no array principal
   */
  const handleViewDetails = (index: number) => {
    setSelectedServiceIndex(index);
    setModalMode("view");
    setIsModalOpen(true);
  };

  /**
   * Abre modal em modo de edição
   * Apenas permite editar serviços que NÃO estão concluídos
   * @param index - Índice do serviço no array principal
   */
  const handleEditService = (index: number) => {
    if (services[index].status !== "concluido") {
      setSelectedServiceIndex(index);
      setModalMode("edit");
      setIsModalOpen(true);
    }
  };

  /**
   * Atualiza os dados de um serviço após edição
   * @param updatedService - Serviço com dados atualizados
   */
  const handleUpdateService = (updatedService: Service) => {
    if (selectedServiceIndex !== null) {
      const newServices = [...services];
      newServices[selectedServiceIndex] = updatedService;
      setServices(newServices);
    }
  };

  // ============================================
  // HANDLERS: Mudança de Status
  // ============================================

  /**
   * Inicia processo de mudança de status
   * Se o novo status for "concluído", exibe modal de confirmação
   * Caso contrário, aplica a mudança imediatamente
   *
   * @param index - Índice do serviço
   * @param newStatus - Novo status a ser aplicado
   */
  const handleStatusChangeRequest = (
    index: number,
    newStatus: ServiceStatus,
  ) => {
    if (newStatus === "concluido") {
      // Status "concluído" requer confirmação pois é irreversível
      setConfirmStatusChange({ open: true, index, newStatus });
    } else {
      // Outros status não requerem confirmação
      handleStatusChange(index, newStatus);
    }
  };

  /**
   * Aplica mudança de status sem confirmação
   * @param index - Índice do serviço
   * @param newStatus - Novo status
   */
  const handleStatusChange = (index: number, newStatus: ServiceStatus) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], status: newStatus };
    setServices(newServices);
  };

  /**
   * Confirma mudança de status para "concluído"
   * Fecha o modal de confirmação após aplicar
   */
  const handleConfirmStatusChange = () => {
    if (confirmStatusChange.index !== null && confirmStatusChange.newStatus) {
      handleStatusChange(
        confirmStatusChange.index,
        confirmStatusChange.newStatus,
      );
    }
    setConfirmStatusChange({ open: false, index: null, newStatus: null });
  };

  /**
   * Configuração das 3 colunas do dashboard
   * Cada coluna agrupa serviços por status e exibe estatísticas
   *
   * Estrutura:
   * - id: identificador único da coluna
   * - title: título exibido no cabeçalho
   * - subtitle: descrição da coluna
   * - dotColor: cor do indicador visual (variável CSS)
   * - items: array de serviços filtrados para esta coluna
   * - emptyMessage: mensagem quando não há serviços
   */
  const columns = [
    {
      id: "aguardando",
      title: "Aguardando Hoje",
      subtitle: "Serviços para realizar hoje",
      dotColor: "var(--status-waiting)", // Amarelo/Amber
      items: aguardandoHoje,
      emptyMessage: "Nenhum serviço para hoje",
    },
    {
      id: "em_andamento",
      title: "Em Andamento",
      subtitle: "Serviços em execução",
      dotColor: "var(--status-progress)", // Cyan (tema Frostify)
      items: emAndamento,
      emptyMessage: "Nenhum serviço em andamento",
    },
    {
      id: "concluido",
      title: "Concluído Hoje",
      subtitle: "Finalizados recentemente",
      dotColor: "var(--status-completed)", // Verde
      items: concluido,
      emptyMessage: "Nenhum serviço concluído",
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral dos serviços do dia. Clique duas vezes em um card para ver
          detalhes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <StatsCard
          title="Hoje"
          value={aguardandoHoje.length}
          icon={CircleDot}
          iconColor="var(--status-waiting)"
          subtitle="aguardando"
        />
        <StatsCard
          title="Em Andamento"
          value={emAndamento.length}
          icon={Play}
          iconColor="var(--status-progress)"
        />
        <StatsCard
          title="Agendados"
          value={agendadosFuturos.length}
          icon={CalendarClock}
          iconColor="var(--status-scheduled)"
          subtitle="próximos dias"
        />
        <StatsCard
          title="Concluídos"
          value={concluido.length}
          icon={CheckCircle}
          iconColor="var(--status-completed)"
        />
      </div>

      {agendadosFuturos.length > 0 && (
        <div className="mb-6 p-4 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <CalendarClock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {agendadosFuturos.length} serviço
                  {agendadosFuturos.length > 1 ? "s" : ""} agendado
                  {agendadosFuturos.length > 1 ? "s" : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  Consulte todos os serviços agendados na página de Serviços
                </p>
              </div>
            </div>
            <Link href="/servicos?filter=aguardando">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
              >
                Ver agenda
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: column.dotColor }}
                />
                <div>
                  <h2 className="font-medium text-foreground">
                    {column.title}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {column.subtitle}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs font-normal">
                {column.items.length}
              </Badge>
            </div>

            <div className="flex-1 space-y-3 min-h-[200px] p-3 rounded-lg bg-secondary/20 border border-border/50">
              {column.items.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  {column.emptyMessage}
                </div>
              ) : (
                column.items.map((item) => (
                  <ServiceCard
                    key={item.index}
                    service={item.service}
                    index={item.index}
                    onDoubleClick={() => handleDoubleClick(item.index)}
                    onViewDetails={() => handleViewDetails(item.index)}
                    onEditService={() => handleEditService(item.index)}
                    onStatusChange={handleStatusChangeRequest}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>

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
