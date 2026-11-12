import { describeDiagnosis, findRootCause, type Diagnosis } from '../diagnosis/findRootCause';
import type { ScenarioId, Trace } from '../entities/Trace';
import { summarize, type MetricsSummary } from '../metrics/summarize';
import type { PaymentRepository } from '../repositories/PaymentRepository';
import type { TelemetryRepository } from '../repositories/TelemetryRepository';
import { toWaterfall, type WaterfallRow } from '../tracing/waterfall';

export type PaymentReport = {
  trace: Trace;
  waterfall: WaterfallRow[];
  diagnosis: Diagnosis;
  diagnosisText: string;
  metrics: MetricsSummary;
};

export class SendPaymentUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly telemetryRepository: TelemetryRepository,
  ) {}

  async execute(scenario: ScenarioId): Promise<PaymentReport> {
    const trace = await this.paymentRepository.send(scenario);
    this.telemetryRepository.save(trace);

    const diagnosis = findRootCause(trace);
    const originSpanId = diagnosis.kind === 'fallo' ? diagnosis.origin.spanId : null;

    return {
      trace,
      waterfall: toWaterfall(trace, originSpanId),
      diagnosis,
      diagnosisText: describeDiagnosis(diagnosis),
      metrics: summarize(this.telemetryRepository.all()),
    };
  }
}
