import type { ScenarioId, Trace } from '../entities/Trace';

/** Envía un pago por la cadena de servicios y devuelve la telemetría que dejó. */
export interface PaymentRepository {
  send(scenario: ScenarioId): Promise<Trace>;
}
