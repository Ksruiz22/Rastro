import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { continueTrace, startTrace, toTraceparent } from './traceContext';

describe('startTrace', () => {
  it('crea identificadores con el tamaño del estándar W3C', () => {
    const root = startTrace();

    assert.match(root.traceId, /^[0-9a-f]{32}$/);
    assert.match(root.spanId, /^[0-9a-f]{16}$/);
    assert.equal(root.parentSpanId, null);
  });
});

describe('toTraceparent', () => {
  it('arma la cabecera versión-traza-span-flags', () => {
    const header = toTraceparent({
      traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
      spanId: '00f067aa0ba902b7',
      parentSpanId: null,
    });

    assert.equal(header, '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01');
  });
});

describe('continueTrace', () => {
  it('conserva el traceId y cuelga el span nuevo del que llamó', () => {
    const caller = startTrace();
    const child = continueTrace(toTraceparent(caller));

    assert.equal(child.traceId, caller.traceId);
    assert.equal(child.parentSpanId, caller.spanId);
    assert.notEqual(child.spanId, caller.spanId);
  });

  it('empieza una traza nueva si la cabecera no llega bien', () => {
    const caller = startTrace();
    const orphan = continueTrace('cabecera-perdida');

    assert.notEqual(orphan.traceId, caller.traceId);
    assert.equal(orphan.parentSpanId, null);
  });
});
