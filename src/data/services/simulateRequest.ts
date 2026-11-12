import { formatMs } from '../../domain/diagnosis/formatters';
import type { LogEntry, LogLevel, Span, SpanStatus, Trace } from '../../domain/entities/Trace';
import {
  continueTrace,
  startTrace,
  toTraceparent,
  type RandomSource,
  type TraceContext,
} from '../../domain/tracing/traceContext';
import type { Hop } from './serviceChain';

export type SimulationOptions = {
  random?: RandomSource;
  /** Variación de los tiempos entre peticiones (0.1 = ±10 %). */
  variation?: number;
};

/**
 * Recorre la cadena de servicios con un reloj virtual (no espera de verdad)
 * y deja lo que dejaría un sistema instrumentado: spans y logs con el mismo traceId.
 */
export function simulateRequest(chain: Hop, options: SimulationOptions = {}): Trace {
  const random = options.random ?? Math.random;
  const variation = options.variation ?? 0.1;
  const spans: Span[] = [];
  const logs: LogEntry[] = [];

  const vary = (ms: number) => Math.round(ms * (1 + variation * (random() * 2 - 1)));

  function visit(
    hop: Hop,
    context: TraceContext,
    startMs: number,
    budgetMs?: number,
  ): { durationMs: number; status: SpanStatus } {
    const span: Span = {
      traceId: context.traceId,
      spanId: context.spanId,
      parentSpanId: context.parentSpanId,
      service: hop.service,
      external: hop.external === true,
      startMs,
      durationMs: 0,
      status: 'ok',
    };
    spans.push(span);

    const log = (level: LogLevel, message: string, atMs: number) => {
      // Un proveedor externo es una caja negra: no vemos sus logs.
      if (span.external) return;
      logs.push({
        traceId: span.traceId,
        spanId: span.spanId,
        service: span.service,
        level,
        message,
        atMs,
      });
    };

    if (hop.startLog) log('info', hop.startLog, startMs);
    let now = startMs + vary(hop.beforeMs);

    for (const next of hop.calls ?? []) {
      // Propagación de contexto: el identificador viaja en la cabecera traceparent.
      const header = toTraceparent(context);
      const result = visit(next, continueTrace(header, random), now, hop.timeoutMs);
      now += result.durationMs;

      if (result.status === 'timeout') {
        span.status = 'error';
        log(
          'warn',
          `tiempo agotado esperando a ${next.service} (${formatMs(result.durationMs)} ms)`,
          now,
        );
        break;
      }
      if (result.status === 'error') {
        span.status = 'error';
        log('error', `${next.service} respondió con error`, now);
        break;
      }
    }

    if (span.status === 'ok' && hop.failure) {
      span.status = 'error';
      log('error', hop.failure, now);
    } else if (span.status === 'ok' && hop.okLog) {
      log('info', hop.okLog, now);
    }

    now += vary(hop.afterMs);
    let durationMs = now - startMs;

    // Quien llama no espera para siempre: si se pasa del límite, corta.
    if (budgetMs !== undefined && durationMs > budgetMs) {
      durationMs = budgetMs;
      span.status = 'timeout';
    }

    span.durationMs = durationMs;
    return { durationMs, status: span.status };
  }

  const root = startTrace(random);
  const result = visit(chain, root, 0);
  const timedOut = spans.some((span) => span.status === 'timeout');

  return {
    traceId: root.traceId,
    traceparent: toTraceparent(root),
    httpStatus: result.status === 'ok' ? 200 : timedOut ? 504 : 500,
    durationMs: result.durationMs,
    spans,
    logs,
  };
}
