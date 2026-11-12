import type { Span, Trace } from '../entities/Trace';
import { formatMs, joinNames } from './formatters';

export type Diagnosis =
  | { kind: 'ok'; slowest: Span; selfMs: number }
  | {
      kind: 'fallo';
      /** El span donde nace el fallo: el más profundo que falló. */
      origin: Span;
      /** Servicios que heredan el fallo, del más cercano a la entrada. */
      affected: string[];
    };

function ancestorsOf(span: Span, byId: Map<string, Span>): Span[] {
  const out: Span[] = [];
  let current = span;
  while (current.parentSpanId) {
    const parent = byId.get(current.parentSpanId);
    if (!parent) break;
    out.push(parent);
    current = parent;
  }
  return out;
}

/**
 * Regla simple de causa raíz: el síntoma aparece en la entrada, pero el fallo
 * nace en el span fallido que no tiene hijos fallidos.
 */
export function findRootCause(trace: Trace): Diagnosis {
  const byId = new Map<string, Span>();
  for (const span of trace.spans) {
    byId.set(span.spanId, span);
  }

  const failed = trace.spans.filter((span) => span.status !== 'ok');
  const origin = failed.find(
    (span) => !failed.some((other) => other.parentSpanId === span.spanId),
  );

  if (origin) {
    return {
      kind: 'fallo',
      origin,
      affected: ancestorsOf(origin, byId).map((span) => span.service),
    };
  }

  // Sin fallos: el tiempo propio de cada span es su duración menos la de sus hijos.
  let slowest = trace.spans[0];
  let slowestSelf = -1;
  for (const span of trace.spans) {
    const children = trace.spans.filter((other) => other.parentSpanId === span.spanId);
    const selfMs = span.durationMs - children.reduce((sum, child) => sum + child.durationMs, 0);
    if (selfMs > slowestSelf) {
      slowest = span;
      slowestSelf = selfMs;
    }
  }
  return { kind: 'ok', slowest, selfMs: Math.max(slowestSelf, 0) };
}

export function describeDiagnosis(diagnosis: Diagnosis): string {
  if (diagnosis.kind === 'ok') {
    return `Sin fallos. Donde más tiempo se fue: ${diagnosis.slowest.service} (${formatMs(diagnosis.selfMs)} ms).`;
  }

  const { origin, affected } = diagnosis;
  const path = affected.length > 0 ? ` El fallo sube por ${joinNames(affected)}.` : '';

  if (origin.status === 'timeout' && affected.length > 0) {
    return `${affected[0]} esperó a ${origin.service} hasta agotar el tiempo (${formatMs(origin.durationMs)} ms).${path}`;
  }
  return `${origin.service} respondió con error a los ${formatMs(origin.durationMs)} ms.${path}`;
}
