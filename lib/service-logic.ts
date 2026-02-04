import { Service, ServiceStatus } from "./data";

/**
 * Service Logic Module
 * Encapsulates all business rules related to Service Orders (OS).
 */

/**
 * Starts a service execution.
 * Rules:
 * - Update status to 'em_andamento'
 * - Set actualStartTime to now (if not already set)
 */
export function startService(service: Service): Service {
  return {
    ...service,
    status: "em_andamento",
    actualStartTime: service.actualStartTime || new Date(),
  };
}

/**
 * Completes a service execution.
 * Rules:
 * - Update status to 'concluido'
 * - Set actualEndTime to now (if not already set)
 */
export function completeService(service: Service): Service {
  return {
    ...service,
    status: "concluido",
    actualEndTime: service.actualEndTime || new Date(),
  };
}

/**
 * Resets a service to 'waiting' status.
 * Rules:
 * - Clear actual start/end times if we are rolling back state?
 * - Or maybe keep history? For now let's simple reset status but maybe keep times as history?
 * - Requirement says "When status changes to X... register Y". It implies if we go back we might want to clear or keep.
 * - Logic decision: If we move back to waiting, we likely pressed 'start' by mistake. Let's clear start/end times to be safe.
 */
export function resetServiceStatus(service: Service): Service {
  return {
    ...service,
    status: "aguardando",
    actualStartTime: undefined,
    actualEndTime: undefined,
  };
}

/**
 * Handles generic status change requests.
 */
export function handleServiceStatusChange(
  service: Service,
  newStatus: ServiceStatus,
): Service {
  switch (newStatus) {
    case "em_andamento":
      return startService(service);
    case "concluido":
      return completeService(service);
    case "aguardando":
      return resetServiceStatus(service);
    default:
      return { ...service, status: newStatus };
  }
}
