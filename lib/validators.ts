// ============================================
// VALIDAÇÃO DE FORMULÁRIOS
// ============================================
// Este módulo centraliza toda a lógica de validação de formulários
// do sistema, garantindo consistência nas regras de negócio.

/**
 * Interface que define os dados do formulário de cliente
 * Todos os campos são obrigatórios para cadastro/edição
 */
export interface ClientFormData {
  name: string;
  phone: string; // Formato esperado: (00) 00000-0000
  email: string; // Formato esperado: usuario@dominio.com
  cpf: string; // Formato esperado: CPF (11 dígitos) ou CNPJ (14 dígitos)
  address: string;
}

/**
 * Interface que armazena mensagens de erro de validação
 * Apenas os campos com erro estarão presentes no objeto
 */
export interface ValidationErrors {
  name?: string;
  phone?: string;
  email?: string;
  cpf?: string;
  address?: string;
}

/**
 * Valida todos os campos do formulário de cliente
 *
 * Regras aplicadas:
 * - Nome: mínimo 3 caracteres, não pode ser vazio
 * - Telefone: 10 ou 11 dígitos numéricos
 * - Email: formato válido (usuario@dominio.ext)
 * - CPF/CNPJ: 11 dígitos (CPF) ou 14 dígitos (CNPJ)
 * - Endereço: mínimo 10 caracteres, não pode ser vazio
 *
 * @param data - Dados do formulário a serem validados
 * @returns Objeto contendo:
 *   - isValid: true se todos os campos são válidos
 *   - errors: objeto com mensagens de erro para campos inválidos
 */
export function validateClientForm(data: ClientFormData): {
  isValid: boolean;
  errors: ValidationErrors;
} {
  const errors: ValidationErrors = {};

  // Validação de Nome
  // Remove espaços em branco nas extremidades para validação precisa
  if (!data.name.trim()) {
    errors.name = "Nome é obrigatório";
  } else if (data.name.trim().length < 3) {
    errors.name = "Nome deve ter pelo menos 3 caracteres";
  }

  // Validação de Telefone
  // Remove toda formatação (parênteses, traços, espaços) para contar apenas dígitos
  const phoneNumbers = data.phone.replace(/\D/g, "");
  if (!phoneNumbers) {
    errors.phone = "Telefone é obrigatório";
  } else if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
    // 10 dígitos: telefone fixo (DDD + 8 dígitos)
    // 11 dígitos: celular (DDD + 9 dígitos)
    errors.phone = "Telefone deve ter 10 ou 11 dígitos";
  }

  // Validação de E-mail
  // Regex simplificado que valida formato básico: texto@texto.texto
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email.trim()) {
    errors.email = "E-mail é obrigatório";
  } else if (!emailRegex.test(data.email)) {
    errors.email = "E-mail inválido";
  }

  // Validação de CPF/CNPJ
  // Remove toda formatação para contar apenas dígitos
  const cpfNumbers = data.cpf.replace(/\D/g, "");
  if (!cpfNumbers) {
    errors.cpf = "CPF/CNPJ é obrigatório";
  } else if (cpfNumbers.length !== 11 && cpfNumbers.length !== 14) {
    // CPF: 11 dígitos (000.000.000-00)
    // CNPJ: 14 dígitos (00.000.000/0000-00)
    errors.cpf = "CPF deve ter 11 dígitos ou CNPJ 14 dígitos";
  }

  // Validação de Endereço
  // Exige mínimo de 10 caracteres para garantir endereço completo
  if (!data.address.trim()) {
    errors.address = "Endereço é obrigatório";
  } else if (data.address.trim().length < 10) {
    errors.address = "Endereço deve ter pelo menos 10 caracteres";
  }

  // Retorna resultado da validação
  // isValid será true apenas se nenhum erro foi encontrado
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
