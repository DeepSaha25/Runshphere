import React from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';
import {Colors} from '../theme/colors';

interface DataChipProps {
  label: string;
  color?: string;
  style?: ViewStyle;
}

const DataChip: React.FC<DataChipProps> = ({
  label,
  color = Colors.tertiary,
  style,
}) => {
  return (
    <View style={[styles.chip, {backgroundColor: color + '33'}, style]}>
      <Text style={[styles.text, {color}]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: 'Lexend-Bold',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});

export default DataChip;
