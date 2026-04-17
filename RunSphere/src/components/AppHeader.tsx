import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Colors} from '../theme/colors';

interface AppHeaderProps {
  showStreak?: boolean;
  streakCount?: number;
  rightElement?: React.ReactNode;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  showStreak = false,
  streakCount = 0,
  rightElement,
}) => (
  <View style={styles.header}>
    <View style={styles.logoRow}>
      <Text style={styles.logoIcon}>⚡</Text>
      <Text style={styles.logoText}>RUNSPHERE</Text>
    </View>
    <View style={styles.rightSection}>
      {showStreak ? (
        <View style={styles.streakBadge}>
          <Text style={styles.streakIcon}>⚡</Text>
          <Text style={styles.streakText}>{streakCount} STREAK</Text>
        </View>
      ) : null}
      {rightElement}
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: 'transparent',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoIcon: {
    fontSize: 20,
    color: Colors.neonYellow,
  },
  logoText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 20,
    fontWeight: '900',
    fontStyle: 'italic',
    color: Colors.neonYellow,
    letterSpacing: 4,
    textShadowColor: 'rgba(202,253,0,0.4)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 10,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  streakIcon: {
    fontSize: 14,
    color: Colors.primaryContainer,
  },
  streakText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});

export default AppHeader;
