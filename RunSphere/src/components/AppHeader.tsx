import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';

interface AppHeaderProps {
  showStreak?: boolean;
  streakCount?: number;
  rightElement?: React.ReactNode;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  showStreak = false,
  streakCount = 0,
  rightElement,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const openProfile = () => {
    navigation.navigate('Profile');
  };

  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 16) }]}>
      <View style={styles.leftCluster}>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.logoText}>
          RunSphere
        </Text>
      </View>

      {rightElement || (
        <View style={styles.rightCluster}>
          {showStreak ? (
            <View style={styles.streakBadge}>
              <View style={styles.streakDot} />
              <Text style={styles.streakText}>{streakCount}</Text>
            </View>
          ) : null}
          <TouchableOpacity
            activeOpacity={0.76}
            onPress={openProfile}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>RS</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingBottom: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerLow + 'F2',
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 12,
  },
  leftCluster: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 12,
  },
  logoText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 21,
    fontWeight: '900',
    fontStyle: 'italic',
    color: Colors.primary,
    letterSpacing: 0,
    flexShrink: 1,
    textShadowColor: 'rgba(153,247,255,0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  avatar: {
    width: 38,
    height: 38,
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
    gap: 8,
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
