import { InMemoryTelemetryRepository } from '../data/repositories/InMemoryTelemetryRepository';
import { SimulatedPaymentRepository } from '../data/repositories/SimulatedPaymentRepository';
import { SendPaymentUseCase } from '../domain/usecases/SendPaymentUseCase';

const paymentRepository = new SimulatedPaymentRepository();
const telemetryRepository = new InMemoryTelemetryRepository();

/** Composition root: cablea implementaciones de datos a casos de uso del dominio. */
export const sendPaymentUseCase = new SendPaymentUseCase(paymentRepository, telemetryRepository);
