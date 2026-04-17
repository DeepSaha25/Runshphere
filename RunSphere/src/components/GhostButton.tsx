import React from 'react';
import {TouchableOpacity, Text, StyleSheet, ViewStyle} from 'react-native';
import {Colors} from '../theme/colors';

interface GhostButtonProps {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
  color?: string;
}

const GhostButton: React.FC<GhostButtonProps> = ({
  title,
  onPress,
  style,
  color = Colors.primary,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.container, {borderColor: color + '26'}, style]}>
      <Text style={[styles.text, {color}]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: 'center',
  },
  text: {
    fontFamily: 'Lexend-Bold',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});

export default GhostButton;
