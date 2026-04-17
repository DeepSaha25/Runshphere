import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import {Colors} from '../theme/colors';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  trackColor?: string;
  height?: number;
  style?: ViewStyle;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = Colors.primaryContainer,
  trackColor = Colors.surfaceContainerHighest,
  height = 8,
  style,
}) => {
  return (
    <View style={[styles.track, {backgroundColor: trackColor, height}, style]}>
      <View
        style={[
          styles.fill,
          {
            backgroundColor: color,
            width: `${Math.min(100, Math.max(0, progress))}%`,
            height,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    borderRadius: 9999,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: 9999,
  },
});

export default ProgressBar;
