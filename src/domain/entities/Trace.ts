export type SpanStatus = 'ok' | 'error' | 'timeout';

/** Un paso del recorrido: qué servicio, cuándo empezó, cuánto duró y si falló. */
export type Span = {
  traceId: string;
  spanId: string;
  parentSpanId: string | null;
  service: string;
  /** Proveedor que no controlamos: solo vemos qué responde y cuándo. */
  external: boolean;
  startMs: number;
  durationMs: number;
  status: SpanStatus;
};

export type LogLevel = 'info' | 'warn' | 'error';

/** Registro escrito por un servicio; el traceId lo une a su traza. */
export type LogEntry = {
  traceId: string;
  spanId: string;
  service: string;
  level: LogLevel;
  message: string;
  atMs: number;
};

/** El recorrido completo de una petición, con un identificador único. */
export type Trace = {
  traceId: string;
  traceparent: string;
  httpStatus: number;
  durationMs: number;
  spans: Span[];
  logs: LogEntry[];
};

export type ScenarioId = 'normal' | 'pasarela-lenta' | 'base-caida';
