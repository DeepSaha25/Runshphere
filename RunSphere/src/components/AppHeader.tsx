import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Colors} from '../theme/colors';

interface AppHeaderProps {
  showStreak?: boolean;
  streakCount?: number;
  rightElement?: React.ReactNode;
  onMenuPress?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  showStreak = false,
  streakCount = 0,
  rightElement,
  onMenuPress,
}) => (
  <View style={styles.header}>
    <View style={styles.leftCluster}>
      <TouchableOpacity
        activeOpacity={0.72}
        onPress={onMenuPress}
        style={styles.menuButton}>
        <Text style={styles.menuText}>menu</Text>
      </TouchableOpacity>
      <Text style={styles.logoText}>RUNSPHERE</Text>
    </View>

    {rightElement || (
      <View style={styles.rightCluster}>
        {showStreak ? (
          <View style={styles.streakBadge}>
            <View style={styles.streakDot} />
            <Text style={styles.streakText}>{streakCount}</Text>
          </View>
        ) : null}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>RS</Text>
        </View>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  header: {
    minHeight: 72,
    paddingTop: 18,
    paddingBottom: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface + '99',
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 12,
  },
  leftCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuButton: {
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  logoText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    color: Colors.primary,
    letterSpacing: -0.5,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(153,247,255,0.8)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
    borderWidth: 2,
    borderColor: Colors.primary + '33',
  },
  avatarText: {
    color: Colors.primary,
    fontFamily: 'Lexend-Bold',
    fontSize: 12,
    fontWeight: '900',
  },
  rightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  streakDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: Colors.secondary,
  },
  streakText: {
    color: Colors.secondary,
    fontSize: 10,
    fontWeight: '900',
  },
});

export default AppHeader;
