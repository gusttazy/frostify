import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

/**
 * Props para o componente StatsCard
 */
interface StatsCardProps {
  /** Título do card (ex: "Serviços Hoje") */
  title: string;

  /** Valor numérico a ser exibido (ex: 12) */
  value: number;

  /** Ícone do Lucide React a ser exibido */
  icon: LucideIcon;

  /** Cor de fundo do card (opcional) */
  color?: string;

  /** Cor do ícone e seu background (ex: "var(--primary)") */
  iconColor?: string;

  /** Texto complementar ao lado do valor (ex: "serviços") */
  subtitle?: string;
}

/**
 * Card de estatísticas para o dashboard
 *
 * Exibe um valor numérico destacado com título, ícone e opcional subtitle.
 * O ícone recebe um background colorido usando color-mix para criar
 * uma versão semi-transparente da cor especificada.
 *
 * Caso de uso:
 * - Cards de métricas no dashboard
 * - Resumos numéricos de dados
 * - Indicadores visuais rápidos
 *
 * @example
 * <StatsCard
 *   title="Serviços Hoje"
 *   value={12}
 *   icon={CalendarClock}
 *   iconColor="var(--primary)"
 *   subtitle="agendados"
 * />
 */
export function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  iconColor,
  subtitle,
}: StatsCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          {/* Texto: Título e Valor */}
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
              {title}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-semibold text-foreground">{value}</p>
              {subtitle && (
                <span className="text-xs text-muted-foreground">
                  {subtitle}
                </span>
              )}
            </div>
          </div>

          {/* Ícone com background colorido */}
          <div
            className="p-2.5 rounded-lg"
            style={{
              // Usa color-mix para criar background semi-transparente (15% opacidade)
              backgroundColor: iconColor
                ? `color-mix(in oklch, ${iconColor} 15%, transparent)`
                : "var(--secondary)",
              color: iconColor || "var(--muted-foreground)",
            }}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
