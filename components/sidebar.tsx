"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Wrench,
  Snowflake,
  PanelLeftClose,
  PanelLeft,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/theme-provider";

/**
 * Configuração dos itens de navegação da sidebar
 * Cada item possui href (rota), label (texto) e icon (ícone Lucide)
 */
const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/servicos", label: "Serviços", icon: Wrench },
];

/**
 * Componente Sidebar - Barra lateral de navegação principal
 *
 * Funcionalidades:
 * - **Navegação**: Links para Dashboard, Clientes e Serviços
 * - **Collapse/Expand**: Pode ser recolhida (ícones apenas) ou expandida (com texto)
 * - **Hover Expansion**: Expande temporariamente ao passar mouse (desktop)
 * - **Persistência**: Estado collapse salvo no localStorage
 * - **Mobile Menu**: Menu overlay em dispositivos móveis
 * - **Theme Toggle**: Botão para alternar entre tema claro/escuro
 * - **Marca**: Logo Frostify com ícone de floco de neve
 * - **Indicador de Rota Ativa**: Destaque visual na página atual
 *
 * Comportamento por dispositivo:
 * - **Desktop**: Sidebar fixa, pode ser colapsada/expandida com botão
 * - **Mobile**: Sidebar oculta por padrão, abre via botão hamburger
 *
 * Estados:
 * - `isCollapsed`: Sidebar permanentemente recolhida (toggle manual)
 * - `isHovered`: Sidebar temporariamente expandida (hover do mouse)
 * - `mobileOpen`: Menu mobile visível/oculto
 */
export function Sidebar() {
  // ============================================
  // HOOKS E ESTADO
  // ============================================

  const pathname = usePathname(); // Rota atual (para highlight)

  /** Sidebar permanentemente colapsada (persiste em localStorage) */
  const [isCollapsed, setIsCollapsed] = useState(true);

  /** Sidebar temporariamente expandida por hover (desktop apenas) */
  const [isHovered, setIsHovered] = useState(false);

  /** Menu mobile aberto/fechado */
  const [mobileOpen, setMobileOpen] = useState(false);

  /** Tema atual e função de toggle */
  const { theme, toggleTheme } = useTheme();

  /** Flag de hidratação (evita mismatch SSR) */
  const [mounted, setMounted] = useState(false);

  // ============================================
  // EFEITOS
  // ============================================

  /**
   * Inicializa estado de collapse do localStorage
   * Marca componente como montado após hidratação
   */
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  // ============================================
  // HANDLERS
  // ============================================

  /**
   * Toggle manual do collapse (botão)
   * Salva preferência no localStorage
   */
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", JSON.stringify(newState));
  };

  // ============================================
  // ESTADOS DERIVADOS
  // ============================================

  /**
   * Sidebar deve estar visualmente expandida se:
   * - Menu mobile está aberto OU
   * - Não está colapsada (locked open) OU
   * - Está sendo hovered (expansão temporária)
   */
  const isExpanded = mobileOpen || !isCollapsed || isHovered;

  /**
   * Largura do placeholder (previne content jump)
   * Quando hover-expandida, mantém width pequeno (não empurra conteúdo)
   * Somente expande permanentemente quando toggle manual
   */
  const layoutWidth = isCollapsed ? "w-[72px]" : "w-64";

  const showMobile = mobileOpen;

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Placeholder for Desktop Layout - Prevents content jump when hovering */}
      <div
        className={cn(
          "hidden lg:block shrink-0 transition-all duration-300 ease-in-out",
          layoutWidth,
        )}
      />

      {/* Actual Sidebar - Fixed positioning allows hover expansion without pushing content */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out",
          // Mobile visibility
          mobileOpen
            ? "translate-x-0 w-64 shadow-2xl"
            : "-translate-x-full lg:translate-x-0",
          // Desktop width logic (only applies if visible/desktop)
          !mobileOpen && (isExpanded ? "w-64" : "w-[72px]"),
          // Hover shadow effect for desktop
          isCollapsed &&
            isHovered &&
            !mobileOpen &&
            "shadow-2xl border-primary/20",
        )}
        onMouseEnter={() => {
          // Only enable hover expansion on large screens (desktop)
          if (window.innerWidth >= 1024) {
            setIsHovered(true);
          }
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-4 border-b border-border h-[73px] flex items-center">
          <Link
            href="/"
            className="flex items-center gap-3 w-full"
            onClick={() => setMobileOpen(false)}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shrink-0 transition-transform hover:scale-105">
              <Snowflake className="h-6 w-6 text-primary-foreground" />
            </div>
            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                isExpanded ? "w-auto opacity-100 pl-1" : "w-0 opacity-0",
              )}
            >
              <h1 className="font-semibold text-foreground whitespace-nowrap">
                Frostify
              </h1>
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                Sistema de Gestão
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  !isExpanded && "justify-center px-2",
                )}
                title={!isExpanded ? item.label : undefined}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-transform duration-200",
                    !isExpanded && "group-hover:scale-110",
                  )}
                />
                <span
                  className={cn(
                    "whitespace-nowrap transition-all duration-300",
                    isExpanded
                      ? "w-auto opacity-100 translate-x-0"
                      : "w-0 opacity-0 -translate-x-4 absolute left-10",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div
            className={cn(
              "flex items-center gap-2 transition-all duration-300",
              !isExpanded ? "flex-col justify-center" : "justify-between",
            )}
          >
            {/* Theme toggle button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
              title={
                !mounted
                  ? "Alternar tema"
                  : theme === "light"
                    ? "Mudar para tema escuro"
                    : "Mudar para tema claro"
              }
            >
              {!mounted ? (
                <Sun className="h-5 w-5" />
              ) : theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {/* Collapse toggle button - Hidden on Mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className="h-9 w-9 hidden lg:inline-flex"
              title={isCollapsed ? "Fixar menu expandido" : "Recolher menu"}
            >
              {!isCollapsed ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <PanelLeft className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* User info */}
          <div
            className={cn(
              "mt-3 flex items-center gap-3 rounded-lg bg-secondary/50 p-2 transition-all duration-300 overflow-hidden",
              !isExpanded && "justify-center bg-transparent p-0",
            )}
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
              <span className="text-xs font-bold text-primary">TC</span>
            </div>

            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                isExpanded ? "w-auto opacity-100" : "w-0 opacity-0 hidden",
              )}
            >
              <p className="text-sm font-medium text-foreground truncate max-w-[140px]">
                Técnico
              </p>
              <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                admin@frostify.com
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
