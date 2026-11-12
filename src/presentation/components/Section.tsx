import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, mono } from '../theme';

type Props = {
  title: string;
  question: string;
  children: ReactNode;
};

/** Tarjeta con el nombre de la señal y la pregunta que responde. */
export function Section({ title, question, children }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.question}>{question}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  question: {
    color: colors.orange,
    fontFamily: mono,
    fontSize: 11,
  },
});
