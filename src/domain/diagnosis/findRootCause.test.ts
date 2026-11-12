import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Span, SpanStatus, Trace } from '../entities/Trace';
import { summarize } from '../metrics/summarize';
import { describeDiagnosis, findRootCause } from './findRootCause';
import { formatMs, formatPercent, joinNames } from './formatters';

function span(
  service: string,
  parent: string | null,
  startMs: number,
  durationMs: number,
  status: SpanStatus = 'ok',
): Span {
  return {
    traceId: 't1',
    spanId: service,
    parentSpanId: parent,
    service,
    external: false,
    startMs,
    durationMs,
    status,
  };
}

function trace(spans: Span[], httpStatus: number): Trace {
  return {
    traceId: 't1',
    traceparent: '',
    httpStatus,
    durationMs: spans[0].durationMs,
    spans,
    logs: [],
  };
}

describe('findRootCause', () => {
  it('señala el span más profundo que falló, no donde aparece el síntoma', () => {
    const diagnosis = findRootCause(
      trace(
        [
          span('entrada', null, 0, 3120, 'error'),
          span('pedidos', 'entrada', 160, 2940, 'error'),
          span('pagos', 'pedidos', 245, 2820, 'error'),
          span('pasarela externa', 'pagos', 255, 2800, 'timeout'),
        ],
        504,
      ),
    );

    assert.equal(diagnosis.kind, 'fallo');
    assert.equal(
      describeDiagnosis(diagnosis),
      'pagos esperó a pasarela externa hasta agotar el tiempo (2.800 ms). El fallo sube por pagos, pedidos y entrada.',
    );
  });

  it('sin fallos, indica dónde se fue más tiempo propio', () => {
    const diagnosis = findRootCause(
      trace(
        [
          span('entrada', null, 0, 500),
          span('autorizador', 'entrada', 40, 120),
          span('pedidos', 'entrada', 160, 320),
        ],
        200,
      ),
    );

    assert.equal(
      describeDiagnosis(diagnosis),
      'Sin fallos. Donde más tiempo se fue: pedidos (320 ms).',
    );
  });
});

describe('summarize', () => {
  it('cuenta peticiones, errores y latencia p95', () => {
    const samples = Array.from({ length: 20 }, (_, index) => ({
      httpStatus: index < 18 ? 200 : 504,
      durationMs: (index + 1) * 100,
    }));

    assert.deepEqual(summarize(samples), {
      requests: 20,
      errors: 2,
      errorRate: 0.1,
      p95Ms: 1900,
    });
  });

  it('devuelve ceros si aún no hay peticiones', () => {
    assert.deepEqual(summarize([]), { requests: 0, errors: 0, errorRate: 0, p95Ms: 0 });
  });
});

describe('format helpers', () => {
  it('formatea milisegundos, listas y porcentajes en español', () => {
    assert.equal(formatMs(3120), '3.120');
    assert.equal(formatMs(50), '50');
    assert.equal(joinNames(['pagos', 'pedidos', 'entrada']), 'pagos, pedidos y entrada');
    assert.equal(formatPercent(0.1), '10%');
  });
});
