import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatMs } from '../domain/diagnosis/formatters';
import { summarize } from '../domain/metrics/summarize';
import { LogList } from '../presentation/components/LogList';
import { MetricsRow } from '../presentation/components/MetricsRow';
import { ScenarioPicker } from '../presentation/components/ScenarioPicker';
import { Section } from '../presentation/components/Section';
import { TraceWaterfall } from '../presentation/components/TraceWaterfall';
import { usePaymentTrace } from '../presentation/hooks/usePaymentTrace';
import { colors, mono } from '../presentation/theme';

const EMPTY_METRICS = summarize([]);

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { scenario, setScenario, phase, report, errorMessage, sendPayment } = usePaymentTrace();

  const sending = phase === 'sending';
  const failed = report ? report.trace.httpStatus >= 500 : false;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View>
        <Text style={styles.title}>Rastro</Text>
        <Text style={styles.subtitle}>
          Un pago cruza seis servicios. Elige qué falla y mira lo que deja ver la telemetría.
        </Text>
      </View>

      <ScenarioPicker value={scenario} disabled={sending} onChange={setScenario} />

      <Pressable
        style={[styles.button, sending && styles.buttonDisabled]}
        disabled={sending}
        onPress={() => {
          void sendPayment();
        }}
      >
        {sending ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.buttonLabel}>Enviar pago</Text>
        )}
      </Pressable>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      {report ? (
        <>
          <View style={styles.result}>
            <Text style={[styles.status, failed && styles.statusFailed]}>
              {report.trace.httpStatus}
            </Text>
            <View style={styles.resultText}>
              <Text style={styles.resultLabel}>Lo que ve el cliente</Text>
              <Text style={styles.resultLine}>
                {failed ? 'Error al pagar' : 'Pago aprobado'}
                {` · ${formatMs(report.trace.durationMs)} ms`}
              </Text>
            </View>
          </View>

          <Section title="Traza" question="¿Dónde?">
            <Text style={styles.traceparent}>traceparent: {report.trace.traceparent}</Text>
            <TraceWaterfall rows={report.waterfall} />
            <Text style={styles.diagnosis}>
              {failed ? <Text style={styles.diagnosisLabel}>Causa probable: </Text> : null}
              {report.diagnosisText}
            </Text>
          </Section>

          <Section title="Logs" question="¿Qué pasó?">
            <LogList logs={report.trace.logs} />
          </Section>
        </>
      ) : (
        <Text style={styles.hint}>
          Aún no hay peticiones. Envía un pago para ver su traza y sus logs.
        </Text>
      )}

      <Section title="Métricas" question="¿Cuánto?">
        <MetricsRow metrics={report ? report.metrics : EMPTY_METRICS} />
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    gap: 14,
    paddingHorizontal: 16,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightBlue,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonLabel: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '700',
  },
  error: {
    color: colors.orange,
    fontSize: 13,
  },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  status: {
    color: colors.lightBlue,
    fontSize: 34,
    fontWeight: '700',
  },
  statusFailed: {
    color: colors.orange,
  },
  resultText: {
    flex: 1,
    gap: 2,
  },
  resultLabel: {
    color: colors.muted,
    fontSize: 11,
  },
  resultLine: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  traceparent: {
    color: colors.muted,
    fontFamily: mono,
    fontSize: 10,
    lineHeight: 15,
  },
  hint: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  diagnosis: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
  },
  diagnosisLabel: {
    color: colors.orange,
    fontWeight: '700',
  },
});
