import { StyleSheet, Text, View } from 'react-native';

import type { LogEntry, LogLevel } from '../../domain/entities/Trace';
import { colors, mono } from '../theme';

const LEVEL_COLOR: Record<LogLevel, string> = {
  info: colors.muted,
  warn: colors.yellow,
  error: colors.orange,
};

type Props = {
  logs: LogEntry[];
};

/** Los logs de la petición: cada servicio escribió el suyo, el traceId los reúne. */
export function LogList({ logs }: Props) {
  return (
    <View style={styles.wrap}>
      {logs.map((entry, index) => (
        <View key={`${entry.spanId}-${index}`} style={styles.row}>
          <Text style={[styles.level, { color: LEVEL_COLOR[entry.level] }]}>{entry.level}</Text>
          <Text style={styles.message}>
            <Text style={styles.service}>{entry.service}</Text> · {entry.message}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  level: {
    width: 38,
    fontFamily: mono,
    fontSize: 11,
    lineHeight: 17,
  },
  message: {
    flex: 1,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  service: {
    color: colors.text,
    fontWeight: '600',
  },
});
