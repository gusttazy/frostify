import type { Client, Service } from "./data";

// ============================================
// DADOS MOCKADOS - CLIENTES
// ============================================
// 6 clientes fictícios para testes e desenvolvimento
// Para substituir por dados reais, basta importar de uma API/banco de dados

export const mockClients: Client[] = [
  {
    id: "847291",
    name: "João Silva",
    phone: "(11) 99999-1234",
    email: "joao.silva@email.com",
    cpf: "123.456.789-00",
    address: "Rua das Flores, 123 - Centro, São Paulo - SP",
    notes: "Cliente preferencial - atendimento prioritário",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "523816",
    name: "Maria Oliveira",
    phone: "(11) 98888-5678",
    email: "maria.oliveira@email.com",
    cpf: "987.654.321-00",
    address: "Av. Brasil, 456 - Jardim América, São Paulo - SP",
    createdAt: new Date("2024-02-20"),
  },
  {
    id: "164739",
    name: "Restaurante Bom Sabor",
    phone: "(11) 3333-9999",
    email: "contato@bomsabor.com.br",
    cpf: "12.345.678/0001-90",
    address: "Rua da Gastronomia, 789 - Vila Nova, São Paulo - SP",
    notes: "Atendimento comercial - câmaras frigoríficas",
    createdAt: new Date("2024-03-10"),
  },
  {
    id: "938472",
    name: "Pedro Santos",
    phone: "(11) 97777-4321",
    email: "pedro.santos@gmail.com",
    cpf: "456.789.123-00",
    address: "Rua do Comércio, 321 - Centro, Guarulhos - SP",
    createdAt: new Date("2024-04-05"),
  },
  {
    id: "492817",
    name: "Supermercado Extra Bom",
    phone: "(11) 3222-4444",
    email: "gerencia@extrabom.com.br",
    cpf: "23.456.789/0001-01",
    address: "Av. Industrial, 2000 - Distrito Industrial, Osasco - SP",
    notes: "Manutenção mensal das câmaras frigoríficas",
    createdAt: new Date("2024-04-18"),
  },
  {
    id: "294857",
    name: "Sorveteria Gelato",
    phone: "(11) 3555-8888",
    email: "contato@sorveteriagel.com.br",
    cpf: "56.789.012/0001-34",
    address: "Rua Oscar Freire, 450 - Jardins, São Paulo - SP",
    notes: "Manutenção crítica - sorvetes artesanais",
    createdAt: new Date("2024-06-08"),
  },
];

// ============================================
// DADOS MOCKADOS - ORDENS DE SERVIÇO
// ============================================
// 10 ordens de serviço fictícias para testes e desenvolvimento
// Distribuídas entre diferentes status, datas e tipos

// Datas de referência para os serviços
const today = new Date();
const getDate = (daysFromToday: number): Date => {
  const date = new Date(today);
  date.setDate(date.getDate() + daysFromToday);
  return date;
};

export const mockServices: Service[] = [
  // === SERVIÇOS DE HOJE - AGUARDANDO (2) ===
  {
    id: "OS-284719",
    clientId: "847291",
    clientName: "João Silva",
    type: "Manutenção Preventiva",
    description:
      "Limpeza de filtros e verificação de gás do ar-condicionado split",
    date: today,
    scheduledTime: "09:00",
    status: "aguardando",
    createdAt: new Date(),
  },
  {
    id: "OS-391825",
    clientId: "492817",
    clientName: "Supermercado Extra Bom",
    type: "Manutenção Preventiva",
    description: "Revisão mensal das câmaras frigoríficas - 3 unidades",
    date: today,
    scheduledTime: "14:00",
    status: "aguardando",
    createdAt: new Date(),
  },

  // === SERVIÇOS DE HOJE - EM ANDAMENTO (2) ===
  {
    id: "OS-518294",
    clientId: "164739",
    clientName: "Restaurante Bom Sabor",
    type: "Reparo Urgente",
    description:
      "Câmara frigorífica principal não está gelando - verificar compressor",
    date: today,
    scheduledTime: "08:00",
    status: "em_andamento",
    actualStartTime: new Date(today.setHours(8, 15, 0)),
    createdAt: new Date(),
  },
  {
    id: "OS-629405",
    clientId: "294857",
    clientName: "Sorveteria Gelato",
    type: "Manutenção Corretiva",
    description: "Freezer de exposição com formação de gelo excessivo",
    date: today,
    scheduledTime: "10:30",
    status: "em_andamento",
    actualStartTime: new Date(today.setHours(10, 45, 0)),
    createdAt: new Date(),
  },

  // === SERVIÇOS FUTUROS - AGUARDANDO (3) ===
  {
    id: "OS-730516",
    clientId: "523816",
    clientName: "Maria Oliveira",
    type: "Instalação",
    description: "Instalação de ar-condicionado split 12000 BTUs na sala",
    date: getDate(1), // amanhã
    scheduledTime: "10:00",
    status: "aguardando",
    createdAt: new Date(),
  },
  {
    id: "OS-841627",
    clientId: "938472",
    clientName: "Pedro Santos",
    type: "Manutenção Corretiva",
    description: "Ar-condicionado fazendo barulho estranho ao ligar",
    date: getDate(2), // depois de amanhã
    scheduledTime: "15:00",
    status: "aguardando",
    createdAt: new Date(),
  },
  {
    id: "OS-952738",
    clientId: "164739",
    clientName: "Restaurante Bom Sabor",
    type: "Limpeza",
    description: "Limpeza completa e higienização de todos os equipamentos",
    date: getDate(5),
    scheduledTime: "09:00",
    status: "aguardando",
    createdAt: new Date(),
  },

  // === SERVIÇOS CONCLUÍDOS (3) ===
  {
    id: "OS-508283",
    clientId: "847291",
    clientName: "João Silva",
    type: "Manutenção Preventiva",
    description: "Revisão semestral completa do sistema de refrigeração",
    date: getDate(-1), // ontem
    scheduledTime: "09:00",
    status: "concluido",
    actualStartTime: new Date(getDate(-1).setHours(9, 10, 0)),
    actualEndTime: new Date(getDate(-1).setHours(11, 30, 0)),
    createdAt: new Date(),
  },
  {
    id: "OS-619394",
    clientId: "523816",
    clientName: "Maria Oliveira",
    type: "Reparo",
    description: "Troca de compressor do ar-condicionado",
    date: getDate(-2),
    scheduledTime: "14:00",
    status: "concluido",
    actualStartTime: new Date(getDate(-2).setHours(14, 5, 0)),
    actualEndTime: new Date(getDate(-2).setHours(16, 45, 0)),
    createdAt: new Date(),
  },
  {
    id: "OS-720405",
    clientId: "492817",
    clientName: "Supermercado Extra Bom",
    type: "Instalação",
    description: "Instalação de nova câmara fria na seção de congelados",
    date: getDate(-5),
    scheduledTime: "08:00",
    status: "concluido",
    actualStartTime: new Date(getDate(-5).setHours(8, 0, 0)),
    actualEndTime: new Date(getDate(-5).setHours(12, 30, 0)),
    createdAt: new Date(),
  },
];

// ============================================
// FUNÇÕES AUXILIARES PARA DADOS MOCKADOS
// ============================================

/**
 * Retorna uma cópia dos clientes mockados
 * Útil para evitar mutações diretas nos dados originais
 */
export function getMockClients(): Client[] {
  return [...mockClients];
}

/**
 * Retorna uma cópia dos serviços mockados
 * Útil para evitar mutações diretas nos dados originais
 */
export function getMockServices(): Service[] {
  return [...mockServices];
}

/**
 * Busca um cliente pelo ID
 */
export function findClientById(clientId: string): Client | undefined {
  return mockClients.find((c) => c.id === clientId);
}

/**
 * Busca serviços de um cliente específico
 */
export function findServicesByClientId(clientId: string): Service[] {
  return mockServices.filter((s) => s.clientId === clientId);
}

/**
 * Retorna estatísticas dos serviços
 */
export function getServicesStats() {
  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return {
    total: mockServices.length,
    aguardando: mockServices.filter((s) => s.status === "aguardando").length,
    emAndamento: mockServices.filter((s) => s.status === "em_andamento").length,
    concluido: mockServices.filter((s) => s.status === "concluido").length,
    hoje: mockServices.filter((s) => {
      const serviceDate = new Date(s.date);
      return (
        serviceDate >= todayStart &&
        serviceDate < new Date(todayStart.getTime() + 86400000)
      );
    }).length,
  };
}
