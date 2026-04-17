import React from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';
import {Colors} from '../theme/colors';

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  valueColor?: string;
  labelColor?: string;
  bg?: string;
  style?: ViewStyle;
  children?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  valueColor = Colors.onSurface,
  labelColor = Colors.onSurfaceVariant,
  bg = Colors.surfaceContainerHigh,
  style,
  children,
}) => {
  return (
    <View style={[styles.card, {backgroundColor: bg}, style]}>
      <Text style={[styles.label, {color: labelColor}]}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, {color: valueColor}]}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 24,
    borderRadius: 16,
    justifyContent: 'space-between',
    minHeight: 140,
  },
  label: {
    fontFamily: 'Lexend-Bold',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    fontFamily: 'Lexend-Bold',
    fontSize: 36,
    fontWeight: '900',
  },
  unit: {
    fontFamily: 'Lexend-Bold',
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
});

export default StatCard;
