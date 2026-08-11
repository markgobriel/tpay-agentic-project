/**
 * Shared API contracts. No server runtime or Prisma dependencies.
 * Concrete request/response models land with API-001.
 */

export type HealthStatus = "ok";

export interface HealthResponse {
  status: HealthStatus;
  service: "save-and-spend-api";
}
