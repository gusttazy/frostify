// ============================================
// TIPOS E INTERFACES
// ============================================

export type ServiceStatus = "aguardando" | "em_andamento" | "concluido";

export interface Client {
  id: string; // Unique ID: 6 random digits (immutable)
  name: string;
  phone: string;
  email: string;
  cpf: string;
  address: string;
  notes?: string;
  createdAt: Date;
}

export interface Service {
  id: string; // Unique ID: OS-XXXXXX format
  clientId: string;
  clientName: string;
  type: string;
  description: string;
  date: Date;
  scheduledTime?: string; // Format HH:mm
  actualStartTime?: Date;
  actualEndTime?: Date;
  status: ServiceStatus;
  createdAt: Date;
}

// ============================================
// GERADORES DE ID
// ============================================

/**
 * Set que armazena todos os IDs de clientes gerados
 * Garante unicidade dos IDs ao longo da execução do sistema
 */
const usedClientIds = new Set<string>();

/**
 * Gera um ID único de 6 dígitos para novos clientes
 *
 * Algoritmo:
 * 1. Gera número aleatório entre 100000 e 999999
 * 2. Verifica se já foi usado
 * 3. Se sim, gera novo número (loop até encontrar único)
 * 4. Adiciona ao set de IDs usados
 *
 * @returns ID único de 6 dígitos (formato: "123456")
 *
 * @example
 * const id = generateClientId() // "457892"
 */
export function generateClientId(): string {
  let id: string;
  do {
    // Gera número de 6 dígitos (100000 a 999999)
    id = Math.floor(100000 + Math.random() * 900000).toString();
  } while (usedClientIds.has(id)); // Continua até encontrar ID único

  usedClientIds.add(id); // Marca como usado
  return id;
}

/**
 * Set que armazena todos os IDs de serviços (Ordens de Serviço) gerados
 * Garante unicidade dos IDs ao longo da execução do sistema
 */
const usedServiceIds = new Set<string>();

/**
 * Gera um ID único no formato OS-XXXXXX para novos serviços
 *
 * Formato: "OS-" seguido de 6 dígitos aleatórios
 * Exemplo: "OS-123456", "OS-987654"
 *
 * Algoritmo:
 * 1. Gera número aleatório entre 100000 e 999999
 * 2. Formata como "OS-XXXXXX"
 * 3. Verifica se já foi usado
 * 4. Se sim, gera novo número (loop até encontrar único)
 * 5. Adiciona ao set de IDs usados
 *
 * @returns ID único no formato "OS-XXXXXX"
 *
 * @example
 * const id = generateServiceId() // "OS-457892"
 */
export function generateServiceId(): string {
  let id: string;
  do {
    // Gera ID no formato "OS-XXXXXX"
    id = `OS-${Math.floor(100000 + Math.random() * 900000).toString()}`;
  } while (usedServiceIds.has(id)); // Continua até encontrar ID único

  usedServiceIds.add(id); // Marca como usado
  return id;
}

// ============================================
// FUNÇÕES DE BUSCA
// ============================================

/**
 * Busca clientes por múltiplos critérios de forma inteligente
 *
 * Campos pesquisáveis:
 * - Nome (case-insensitive)
 * - ID do cliente (parcial ou completo)
 * - CPF/CNPJ (com ou sem máscara de formatação)
 * - E-mail (case-insensitive)
 * - Telefone (com ou sem máscara de formatação)
 * - Endereço (case-insensitive)
 *
 * Características:
 * - Busca parcial: "joão" encontra "João Silva"
 * - Ignora formatação: "11999887766" encontra "(11) 99988-7766"
 * - Case-insensitive: "SILVA" encontra "Silva"
 * - Se query vazia, retorna todos os clientes
 *
 * @param clients - Array de clientes a serem pesquisados
 * @param query - Texto de busca inserido pelo usuário
 * @returns Array filtrado de clientes que correspondem à busca
 *
 * @example
 * // Busca por nome
 * searchClients(clients, "joão") // Retorna clientes com "joão" no nome
 *
 * // Busca por CPF sem formatação
 * searchClients(clients, "12345678900") // Encontra "123.456.789-00"
 */
export function searchClients(clients: Client[], query: string): Client[] {
  // Se busca vazia, retorna todos
  if (!query.trim()) return clients;

  // Normaliza query para comparação case-insensitive
  const normalizedQuery = query.toLowerCase().trim();

  // Remove toda formatação para busca por números (CPF, telefone)
  const queryWithoutMask = query.replace(/\D/g, "");

  return clients.filter((client) => {
    // Busca por nome (ignora maiúsculas/minúsculas)
    const matchesName = client.name.toLowerCase().includes(normalizedQuery);

    // Busca por ID (aceita ID parcial ou completo)
    const matchesId = client.id.toLowerCase().includes(normalizedQuery);

    // Busca por CPF/CNPJ (ignora formatação como pontos e traços)
    const matchesCpf =
      queryWithoutMask.length > 0 &&
      client.cpf.replace(/\D/g, "").includes(queryWithoutMask);

    // Busca por email (ignora maiúsculas/minúsculas)
    const matchesEmail = client.email.toLowerCase().includes(normalizedQuery);

    // Busca por telefone (ignora formatação como parênteses e traços)
    const matchesPhone =
      queryWithoutMask.length > 0 &&
      client.phone.replace(/\D/g, "").includes(queryWithoutMask);

    // Busca por endereço (ignora maiúsculas/minúsculas)
    const matchesAddress = client.address
      .toLowerCase()
      .includes(normalizedQuery);

    // Retorna true se qualquer critério for atendido (OR lógico)
    return (
      matchesName ||
      matchesId ||
      matchesCpf ||
      matchesEmail ||
      matchesPhone ||
      matchesAddress
    );
  });
}

/**
 * Busca serviços por múltiplos critérios de forma inteligente
 *
 * Campos pesquisáveis:
 * - Nome do cliente (case-insensitive)
 * - ID do serviço/OS (case-insensitive)
 * - ID do cliente associado
 * - CPF/CNPJ do cliente (com ou sem formatação)
 * - Tipo de serviço (case-insensitive)
 * - Descrição do serviço (case-insensitive)
 *
 * Características:
 * - Busca integrada com dados do cliente
 * - Ignora formatação em CPF/CNPJ
 * - Case-insensitive em campos de texto
 * - Se query vazia, retorna todos os serviços
 *
 * @param services - Array de serviços a serem pesquisados
 * @param clients - Array de clientes (para busca por CPF do cliente)
 * @param query - Texto de busca inserido pelo usuário
 * @returns Array filtrado de serviços que correspondem à busca
 *
 * @example
 * // Busca por nome do cliente
 * searchServices(services, clients, "joão") // Retorna serviços do cliente "João"
 *
 * // Busca por ID da OS
 * searchServices(services, clients, "OS-12345") // Retorna serviço específico
 */
export function searchServices(
  services: Service[],
  clients: Client[],
  query: string,
): Service[] {
  // Se busca vazia, retorna todos
  if (!query.trim()) return services;

  // Normaliza query para comparação case-insensitive
  const normalizedQuery = query.toLowerCase().trim();

  return services.filter((service) => {
    // Busca cliente associado para verificar CPF
    const client = clients.find((c) => c.id === service.clientId);
    const clientCpf = client?.cpf || "";

    return (
      // Busca por nome do cliente
      service.clientName.toLowerCase().includes(normalizedQuery) ||
      // Busca por ID do serviço (OS-XXXXXX)
      service.id.toLowerCase().includes(normalizedQuery) ||
      // Busca por ID do cliente
      service.clientId.includes(normalizedQuery) ||
      // Busca por CPF do cliente (ignora formatação)
      clientCpf
        .replace(/\D/g, "")
        .includes(normalizedQuery.replace(/\D/g, "")) ||
      // Busca por tipo de serviço (ex: "Manutenção")
      service.type.toLowerCase().includes(normalizedQuery) ||
      // Busca por descrição do serviço
      service.description.toLowerCase().includes(normalizedQuery)
    );
  });
}

// ============================================
// CONSTANTES
// ============================================

/**
 * Lista de tipos de serviço disponíveis no sistema
 * Usada em dropdowns e formulários de criação/edição de serviços
 */
export const serviceTypes = [
  "Manutenção Preventiva",
  "Manutenção Corretiva",
  "Instalação",
  "Reparo",
  "Reparo Urgente",
  "Limpeza",
  "Recarga de Gás",
];

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

/**
 * Retorna o rótulo legível em português para um status de serviço
 *
 * @param status - Status do serviço (aguardando, em_andamento, concluido)
 * @returns Rótulo formatado do status
 *
 * @example
 * getStatusLabel("aguardando") // "Aguardando"
 * getStatusLabel("em_andamento") // "Em Andamento"
 */
export function getStatusLabel(status: ServiceStatus): string {
  const labels: Record<ServiceStatus, string> = {
    aguardando: "Aguardando",
    em_andamento: "Em Andamento",
    concluido: "Concluído",
  };
  return labels[status];
}

/**
 * Retorna as classes CSS do Tailwind para estilizar badges de status
 *
 * @param status - Status do serviço
 * @returns String de classes CSS Tailwind
 *
 * @deprecated Esta função usa cores hardcoded. Prefira usar as variáveis CSS custom do tema.
 */
export function getStatusColor(status: ServiceStatus): string {
  const colors: Record<ServiceStatus, string> = {
    aguardando: "bg-amber-500/20 text-amber-500 border-amber-500/30",
    em_andamento: "bg-blue-500/20 text-blue-500 border-blue-500/30",
    concluido: "bg-green-500/20 text-green-500 border-green-500/30",
  };
  return colors[status];
}

/**
 * Verifica se duas datas representam o mesmo dia (ignora horário)
 *
 * Compara apenas ano, mês e dia, ignorando horas, minutos e segundos.
 * Útil para filtrar serviços por data específica.
 *
 * @param date1 - Primeira data a comparar
 * @param date2 - Segunda data a comparar
 * @returns true se as datas são do mesmo dia
 *
 * @example
 * const hoje = new Date("2024-01-15 10:30")
 * const tambemHoje = new Date("2024-01-15 18:45")
 * isSameDay(hoje, tambemHoje) // true
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Verifica se uma data é hoje
 *
 * Atalho conveniente para isSameDay(date, new Date())
 *
 * @param date - Data a verificar
 * @returns true se a data é hoje
 *
 * @example
 * isToday(new Date()) // true
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Verifica se uma data é no futuro (após hoje)
 *
 * Compara apenas as datas, ignorando horários.
 * Normaliza ambas as datas para meia-noite antes da comparação.
 *
 * @param date - Data a verificar
 * @returns true se a data é posterior a hoje
 *
 * @example
 * const amanha = new Date()
 * amanha.setDate(amanha.getDate() + 1)
 * isFutureDate(amanha) // true
 */
export function isFutureDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normaliza para meia-noite

  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0); // Normaliza para meia-noite

  return compareDate > today;
}

/**
 * Formata data no formato curto brasileiro
 *
 * @param date - Data a formatar
 * @returns Data formatada como "DD mmm" (ex: "15 jan")
 *
 * @example
 * formatDate(new Date("2024-01-15")) // "15 jan"
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

/**
 * Formata data no formato completo brasileiro
 *
 * @param date - Data a formatar
 * @returns Data formatada como "DD de mmmm de YYYY" (ex: "15 de janeiro de 2024")
 *
 * @example
 * formatFullDate(new Date("2024-01-15")) // "15 de janeiro de 2024"
 */
export function formatFullDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}
