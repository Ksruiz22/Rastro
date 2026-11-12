import type { Trace } from '../entities/Trace';

export type MetricsSummary = {
  requests: number;
  errors: number;
  errorRate: number;
  /** El 95 % de las peticiones tardó esto o menos. */
  p95Ms: number;
};

type Sample = Pick<Trace, 'httpStatus' | 'durationMs'>;

/** Métricas: números en el tiempo que salen de sumar muchas peticiones. */
export function summarize(samples: Sample[]): MetricsSummary {
  const requests = samples.length;
  if (requests === 0) {
    return { requests: 0, errors: 0, errorRate: 0, p95Ms: 0 };
  }

  const errors = samples.filter((sample) => sample.httpStatus >= 500).length;
  const sorted = samples.map((sample) => sample.durationMs).sort((a, b) => a - b);
  const rank = Math.ceil(0.95 * requests) - 1;

  return {
    requests,
    errors,
    errorRate: errors / requests,
    p95Ms: sorted[rank],
  };
}
