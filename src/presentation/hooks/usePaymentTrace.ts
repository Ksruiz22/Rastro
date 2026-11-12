import { useCallback, useState } from 'react';

import { sendPaymentUseCase } from '../../di/container';
import type { ScenarioId } from '../../domain/entities/Trace';
import type { PaymentReport } from '../../domain/usecases/SendPaymentUseCase';

export type Phase = 'idle' | 'sending' | 'done';

export function usePaymentTrace() {
  const [scenario, setScenario] = useState<ScenarioId>('normal');
  const [phase, setPhase] = useState<Phase>('idle');
  const [report, setReport] = useState<PaymentReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sendPayment = useCallback(async () => {
    setPhase('sending');
    setErrorMessage(null);
    try {
      setReport(await sendPaymentUseCase.execute(scenario));
      setPhase('done');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo enviar el pago');
      setPhase('idle');
    }
  }, [scenario]);

  return { scenario, setScenario, phase, report, errorMessage, sendPayment };
}
