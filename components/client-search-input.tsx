"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Search, User, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { type Client, searchClients } from "@/lib/data";
import { cn } from "@/lib/utils";

interface ClientSearchInputProps {
  clients: Client[];
  selectedClient: Client | null;
  onSelectClient: (client: Client | null) => void;
  placeholder?: string;
}

export function ClientSearchInput({
  clients,
  selectedClient,
  onSelectClient,
  placeholder = "Buscar por nome, ID, CPF ou email...",
}: ClientSearchInputProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filteredClients = searchClients(clients, query);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  const handleSelect = (client: Client) => {
    onSelectClient(client);
    setQuery("");
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelectClient(null);
    setQuery("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredClients.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredClients[highlightedIndex]) {
          handleSelect(filteredClients[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (listRef.current && isOpen) {
      const highlightedElement = listRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  if (selectedClient) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-md border border-border bg-muted/50">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <User className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground truncate">
            {selectedClient.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {selectedClient.id} • {selectedClient.cpf}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="p-1 hover:bg-background rounded transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          className="pl-10"
        />
      </div>

      {isOpen && query.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-md border border-border bg-popover shadow-lg"
        >
          {filteredClients.length > 0 ? (
            filteredClients.map((client, index) => (
              <li
                key={client.id}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors",
                  index === highlightedIndex
                    ? "bg-accent"
                    : "hover:bg-accent/50",
                )}
                onClick={() => handleSelect(client)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">
                    {client.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    <span className="font-mono">{client.id}</span>
                    {" • "}
                    {client.cpf}
                    {" • "}
                    {client.email}
                  </p>
                </div>
              </li>
            ))
          ) : (
            <li className="px-3 py-4 text-center text-sm text-muted-foreground">
              Nenhum cliente encontrado
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
