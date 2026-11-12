import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ScenarioId } from '../../domain/entities/Trace';
import { colors } from '../theme';

const SCENARIOS: { id: ScenarioId; label: string }[] = [
  { id: 'normal', label: 'Todo bien' },
  { id: 'pasarela-lenta', label: 'Pasarela lenta' },
  { id: 'base-caida', label: 'Base caída' },
];

type Props = {
  value: ScenarioId;
  disabled: boolean;
  onChange: (scenario: ScenarioId) => void;
};

export function ScenarioPicker({ value, disabled, onChange }: Props) {
  return (
    <View style={styles.row}>
      {SCENARIOS.map((scenario) => {
        const selected = scenario.id === value;
        return (
          <Pressable
            key={scenario.id}
            disabled={disabled}
            onPress={() => onChange(scenario.id)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{scenario.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  chipSelected: {
    borderColor: colors.lightBlue,
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '500',
  },
  labelSelected: {
    color: colors.text,
    fontWeight: '700',
  },
});
