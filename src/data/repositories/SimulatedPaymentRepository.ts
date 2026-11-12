import type { ScenarioId, Trace } from '../../domain/entities/Trace';
import type { PaymentRepository } from '../../domain/repositories/PaymentRepository';
import { buildChain } from '../services/serviceChain';
import { simulateRequest } from '../services/simulateRequest';

/** Pausa breve para que se note el envío; la latencia real va en la traza. */
const SEND_DELAY_MS = 600;

export class SimulatedPaymentRepository implements PaymentRepository {
  async send(scenario: ScenarioId): Promise<Trace> {
    const trace = simulateRequest(buildChain(scenario));
    await new Promise((resolve) => setTimeout(resolve, SEND_DELAY_MS));
    return trace;
  }
}
