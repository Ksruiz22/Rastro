import { StyleSheet, Text, View } from 'react-native';

import { formatMs, formatPercent } from '../../domain/diagnosis/formatters';
import type { MetricsSummary } from '../../domain/metrics/summarize';
import { colors } from '../theme';

type Props = {
  metrics: MetricsSummary;
};

/** Métricas de la sesión: no explican una petición, resumen todas. */
export function MetricsRow({ metrics }: Props) {
  return (
    <View style={styles.row}>
      <Metric label="Peticiones" value={`${metrics.requests}`} />
      <Metric
        label="Con error"
        value={formatPercent(metrics.errorRate)}
        alert={metrics.errors > 0}
      />
      <Metric label="Latencia p95" value={`${formatMs(metrics.p95Ms)} ms`} />
    </View>
  );
}

function Metric({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, alert && styles.alert]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  metric: {
    flex: 1,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    marginBottom: 4,
  },
  value: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  alert: {
    color: colors.orange,
  },
});
