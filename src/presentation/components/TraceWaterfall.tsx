import { StyleSheet, Text, View } from 'react-native';

import { formatMs } from '../../domain/diagnosis/formatters';
import type { WaterfallRow } from '../../domain/tracing/waterfall';
import { colors, mono } from '../theme';

type Props = {
  rows: WaterfallRow[];
};

/** La traza como cascada: una barra por span, ubicada según cuándo empezó y cuánto duró. */
export function TraceWaterfall({ rows }: Props) {
  return (
    <View style={styles.wrap}>
      {rows.map((row) => {
        const rest = Math.max(1 - row.offsetRatio - row.widthRatio, 0);
        return (
          <View key={row.spanId} style={styles.row}>
            <Text
              style={[styles.service, { paddingLeft: row.depth * 6 }, row.isOrigin && styles.origin]}
              numberOfLines={1}
            >
              {row.service}
            </Text>
            <View style={styles.track}>
              <View style={{ flex: row.offsetRatio }} />
              <View
                style={[styles.bar, { flex: row.widthRatio }, row.isOrigin && styles.barOrigin]}
              />
              <View style={{ flex: rest }} />
            </View>
            <Text style={[styles.duration, row.isOrigin && styles.origin]}>
              {formatMs(row.durationMs)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  service: {
    width: 132,
    color: colors.text,
    fontFamily: mono,
    fontSize: 11,
  },
  track: {
    flex: 1,
    height: 14,
    flexDirection: 'row',
  },
  bar: {
    minWidth: 3,
    borderRadius: 4,
    backgroundColor: colors.blue,
  },
  barOrigin: {
    backgroundColor: colors.orange,
  },
  duration: {
    width: 44,
    textAlign: 'right',
    color: colors.muted,
    fontFamily: mono,
    fontSize: 11,
  },
  origin: {
    color: colors.orange,
  },
});
