import type { Trace } from '../entities/Trace';

/** Donde se guardan las trazas para poder consultarlas después. */
export interface TelemetryRepository {
  save(trace: Trace): void;
  all(): Trace[];
}
