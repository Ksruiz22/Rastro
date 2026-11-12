import type { Span, SpanStatus, Trace } from '../entities/Trace';

/** Una fila de la cascada: dónde empieza la barra y cuánto ocupa (0 a 1). */
export type WaterfallRow = {
  spanId: string;
  service: string;
  depth: number;
  offsetRatio: number;
  widthRatio: number;
  durationMs: number;
  status: SpanStatus;
  isOrigin: boolean;
};

function depthOf(span: Span, byId: Map<string, Span>): number {
  let depth = 0;
  let current = span;
  while (current.parentSpanId) {
    const parent = byId.get(current.parentSpanId);
    if (!parent) break;
    depth += 1;
    current = parent;
  }
  return depth;
}

export function toWaterfall(trace: Trace, originSpanId: string | null): WaterfallRow[] {
  const total = Math.max(trace.durationMs, 1);
  const byId = new Map<string, Span>();
  for (const span of trace.spans) {
    byId.set(span.spanId, span);
  }

  return trace.spans.map((span) => ({
    spanId: span.spanId,
    service: span.service,
    depth: depthOf(span, byId),
    offsetRatio: span.startMs / total,
    widthRatio: span.durationMs / total,
    durationMs: span.durationMs,
    status: span.status,
    isOrigin: span.spanId === originSpanId,
  }));
}
