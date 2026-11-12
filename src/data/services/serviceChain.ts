import type { ScenarioId } from '../../domain/entities/Trace';

/** Un servicio simulado: cuánto trabaja, a quién llama y cuánto está dispuesto a esperar. */
export type Hop = {
  service: string;
  external?: boolean;
  /** Trabajo propio antes y después de llamar a otros, en ms. */
  beforeMs: number;
  afterMs: number;
  /** Tiempo máximo que espera a cada servicio que llama. */
  timeoutMs?: number;
  /** Lo que escribe en su log al recibir la petición y al terminar bien. */
  startLog?: string;
  okLog?: string;
  /** Si está definido, el servicio falla con este mensaje. */
  failure?: string;
  calls?: Hop[];
};

/**
 * La petición de pago de la exposición:
 * entrada → autorizador → pedidos → base de datos → pagos → pasarela externa.
 */
export function buildChain(scenario: ScenarioId): Hop {
  const pasarela: Hop = {
    service: 'pasarela externa',
    external: true,
    // Lenta: el proveedor tardaría 30 s, pero pagos solo espera 2,8 s.
    beforeMs: scenario === 'pasarela-lenta' ? 30_000 : 180,
    afterMs: 0,
  };

  const pagos: Hop = {
    service: 'pagos',
    beforeMs: 10,
    afterMs: 10,
    timeoutMs: 2_800,
    okLog: 'cobro aprobado',
    calls: [pasarela],
  };

  const baseDeDatos: Hop = {
    service: 'base de datos',
    beforeMs: scenario === 'base-caida' ? 30 : 50,
    afterMs: 0,
    okLog: 'pedido guardado',
    failure: scenario === 'base-caida' ? 'conexión rechazada' : undefined,
  };

  const pedidos: Hop = {
    service: 'pedidos',
    beforeMs: 35,
    afterMs: 35,
    okLog: 'pedido creado',
    calls: [baseDeDatos, pagos],
  };

  const autorizador: Hop = {
    service: 'autorizador',
    beforeMs: 120,
    afterMs: 0,
    okLog: 'token válido',
  };

  return {
    service: 'entrada',
    beforeMs: 40,
    afterMs: 20,
    startLog: 'POST /pagos',
    okLog: 'respuesta 200',
    calls: [autorizador, pedidos],
  };
}
