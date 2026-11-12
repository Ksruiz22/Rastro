import type { Trace } from '../../domain/entities/Trace';
import type { TelemetryRepository } from '../../domain/repositories/TelemetryRepository';

const MAX_TRACES = 200;

/** Guarda las trazas de la sesión en memoria; una plataforma real las guarda por días. */
export class InMemoryTelemetryRepository implements TelemetryRepository {
  private traces: Trace[] = [];

  save(trace: Trace): void {
    this.traces = [...this.traces, trace].slice(-MAX_TRACES);
  }

  all(): Trace[] {
    return this.traces;
  }
}
