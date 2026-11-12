/** Contexto de traza según el estándar W3C Trace Context. */
export type TraceContext = {
  traceId: string;
  spanId: string;
  parentSpanId: string | null;
};

export type RandomSource = () => number;

const TRACEPARENT = /^00-([0-9a-f]{32})-([0-9a-f]{16})-[0-9a-f]{2}$/;

function randomHex(length: number, random: RandomSource): string {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += Math.floor(random() * 16).toString(16);
  }
  return out;
}

/** Primer servicio del recorrido: crea el identificador de la traza. */
export function startTrace(random: RandomSource = Math.random): TraceContext {
  return {
    traceId: randomHex(32, random),
    spanId: randomHex(16, random),
    parentSpanId: null,
  };
}

/** Cabecera con la que el identificador viaja de un servicio al siguiente. */
export function toTraceparent(context: TraceContext): string {
  return `00-${context.traceId}-${context.spanId}-01`;
}

/**
 * Lo que hace cada servicio al recibir la cabecera: conserva el traceId
 * y crea su propio span, hijo del que lo llamó.
 */
export function continueTrace(
  traceparent: string,
  random: RandomSource = Math.random,
): TraceContext {
  const match = TRACEPARENT.exec(traceparent);
  if (!match) {
    // Sin cabecera válida el rastro se corta: empieza una traza nueva.
    return startTrace(random);
  }
  return {
    traceId: match[1],
    spanId: randomHex(16, random),
    parentSpanId: match[2],
  };
}
