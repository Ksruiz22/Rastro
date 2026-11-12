import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { findRootCause } from '../../domain/diagnosis/findRootCause';
import { buildChain } from './serviceChain';
import { simulateRequest } from './simulateRequest';

const exact = { variation: 0 };

describe('simulateRequest', () => {
  it('con todo bien responde 200 y deja seis spans de una misma traza', () => {
    const trace = simulateRequest(buildChain('normal'), exact);

    assert.equal(trace.httpStatus, 200);
    assert.equal(trace.durationMs, 500);
    assert.equal(trace.spans.length, 6);
    assert.ok(trace.spans.every((span) => span.traceId === trace.traceId));
  });

  it('con la pasarela lenta reproduce la traza de la exposición', () => {
    const trace = simulateRequest(buildChain('pasarela-lenta'), exact);
    const durations = Object.fromEntries(
      trace.spans.map((span) => [span.service, span.durationMs]),
    );

    assert.equal(trace.httpStatus, 504);
    assert.deepEqual(durations, {
      entrada: 3120,
      autorizador: 120,
      pedidos: 2940,
      'base de datos': 50,
      pagos: 2820,
      'pasarela externa': 2800,
    });
  });

  it('propaga el contexto: cada span cuelga del servicio que lo llamó', () => {
    const trace = simulateRequest(buildChain('normal'), exact);
    const parentOf = (service: string) => {
      const span = trace.spans.find((item) => item.service === service);
      return trace.spans.find((item) => item.spanId === span?.parentSpanId)?.service ?? null;
    };

    assert.equal(parentOf('entrada'), null);
    assert.equal(parentOf('pedidos'), 'entrada');
    assert.equal(parentOf('pagos'), 'pedidos');
    assert.equal(parentOf('pasarela externa'), 'pagos');
  });

  it('no tiene logs del proveedor externo, solo de quien lo esperó', () => {
    const trace = simulateRequest(buildChain('pasarela-lenta'), exact);

    assert.ok(trace.logs.every((entry) => entry.service !== 'pasarela externa'));
    assert.ok(
      trace.logs.some((entry) => entry.service === 'pagos' && entry.level === 'warn'),
    );
  });

  it('con la base caída responde 500 y la causa es la base de datos', () => {
    const trace = simulateRequest(buildChain('base-caida'), exact);
    const diagnosis = findRootCause(trace);

    assert.equal(trace.httpStatus, 500);
    assert.equal(diagnosis.kind === 'fallo' ? diagnosis.origin.service : null, 'base de datos');
    assert.ok(trace.spans.every((span) => span.service !== 'pagos'));
  });
});
