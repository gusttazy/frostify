"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Props para o componente ConfirmationModal
 */
interface ConfirmationModalProps {
  /** Controla abertura/fechamento do modal */
  open: boolean;

  /** Callback ao mudar estado de abertura */
  onOpenChange: (open: boolean) => void;

  /** Título do modal */
  title: string;

  /** Descrição/mensagem explicativa */
  description: string;

  /** Texto do botão de confirmação (padrão: "Confirmar") */
  confirmText?: string;

  /** Texto do botão de cancelamento (padrão: "Cancelar") */
  cancelText?: string;

  /** Variante visual: "default" (azul) ou "destructive" (vermelho) */
  variant?: "default" | "destructive";

  /** Callback executado ao confirmar */
  onConfirm: () => void;
}

/**
 * Modal de confirmação genérico reutilizável
 *
 * Usado para confirmar ações importantes antes de executá-las,
 * especialmente ações destrutivas (excluir, marcar como concluído, etc).
 *
 * Funcionalidades:
 * - Título e descrição customizáveis
 * - Textos dos botões personalizáveis
 * - Variante "destructive" para ações perigosas (vermelho)
 * - Integração com AlertDialog do Radix UI
 *
 * @example
 * // Confirmação padrão
 * <ConfirmationModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Salvar alterações"
 *   description="Tem certeza que deseja salvar?"
 *   onConfirm={handleSave}
 * />
 *
 * @example
 * // Confirmação destrutiva
 * <ConfirmationModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Excluir cliente"
 *   description="Esta ação não pode ser desfeita"
 *   confirmText="Excluir"
 *   variant="destructive"
 *   onConfirm={handleDelete}
 * />
 */
export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
  onConfirm,
}: ConfirmationModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* Botão de cancelamento */}
          <AlertDialogCancel className="bg-transparent">
            {cancelText}
          </AlertDialogCancel>

          {/* Botão de confirmação (pode ser destrutivo) */}
          <AlertDialogAction
            onClick={onConfirm}
            className={
              variant === "destructive"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : ""
            }
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
