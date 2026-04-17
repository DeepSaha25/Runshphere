import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import AppHeader from '../components/AppHeader';
import ProgressBar from '../components/ProgressBar';
import {useLeaderboardStore} from '../store/leaderboardStore';
import {useUserStore} from '../store/userStore';
import {Colors} from '../theme/colors';
import {formatClock, formatPace, formatRelativeRunDate} from '../utils/runMetrics';

const HomeScreen = ({navigation}: any) => {
  const profile = useUserStore(state => state.profile);
  const stats = useUserStore(state => state.stats);
  const dailyStats = useUserStore(state => state.dailyStats);
  const weeklyStats = useUserStore(state => state.weeklyStats);
  const recentRuns = useUserStore(state => state.recentRuns);
  const refreshDashboard = useUserStore(state => state.refreshDashboard);
  const isLoading = useUserStore(state => state.isLoading);
  const leaderboardEntries = useLeaderboardStore(state => state.entries);
  const leaderboardRanks = useLeaderboardStore(state => state.ranks);
  const loadLeaderboard = useLeaderboardStore(state => state.loadLeaderboard);
  const [refreshing, setRefreshing] = useState(false);

  const loadHome = useCallback(async () => {
    await Promise.allSettled([
      refreshDashboard(6),
      loadLeaderboard('local', 'today', 3),
      loadLeaderboard('city', 'weekly', 3),
    ]);
  }, [loadLeaderboard, refreshDashboard]);

  useFocusEffect(
    useCallback(() => {
      loadHome();
    }, [loadHome]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadHome();
    } finally {
      setRefreshing(false);
    }
  };

  const lastRun = recentRuns[0];
  const localToday = leaderboardEntries['local:today'] || [];
  const cityWeekly = leaderboardEntries['city:weekly'] || [];
  const localRank = leaderboardRanks['local:today'];
  const weeklyGoalProgress = Math.min(
    100,
    ((weeklyStats?.totalDistance || 0) / 25) * 100,
  );

  const locationLabel = useMemo(() => {
    const city = profile?.location?.city;
    const state = profile?.location?.state;
    if (city && state) {
      return `${city}, ${state}`;
    }
    return city || state || 'Location not synced';
  }, [profile?.location?.city, profile?.location?.state]);

  if (isLoading && !profile) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="large" color={Colors.primaryContainer} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.surfaceDim} />
      <AppHeader showStreak streakCount={profile?.streak || 0} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primaryContainer}
          />
        }>
        <View style={styles.locationBadge}>
          <Text style={styles.locationBadgeText}>{locationLabel}</Text>
        </View>

        <Text style={styles.heroLabel}>TODAY'S DISTANCE</Text>
        <View style={styles.heroValueRow}>
          <Text style={styles.heroValue}>
            {Number(dailyStats?.totalDistance || 0).toFixed(2)}
          </Text>
          <Text style={styles.heroUnit}>KM</Text>
        </View>

        <View style={styles.rankRow}>
          <View style={styles.rankCard}>
            <Text style={styles.rankLabel}>LOCAL RANK</Text>
            <Text style={styles.rankValue}>
              {localRank ? `#${localRank}` : '--'}
            </Text>
          </View>
          <View style={styles.rankDivider} />
          <View style={styles.rankCard}>
            <Text style={styles.rankLabel}>LIFETIME</Text>
            <Text style={styles.rankGlobal}>
              {Number(stats?.totalDistance || profile?.totalDistance || 0).toFixed(1)} km
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('RunTracking')}
          style={styles.startRunWrapper}>
          <LinearGradient
            colors={[Colors.neonYellowLight, Colors.neonYellow]}
            style={styles.startRunButton}>
            <View style={styles.playCircle}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
            <Text style={styles.startRunText}>Start Run</Text>
            <Text style={styles.chevron}>›</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bentoGrid}>
          <View style={styles.lastRunCard}>
            <Text style={styles.cardLabel}>LAST RUN</Text>
            {lastRun ? (
              <>
                <Text style={styles.lastRunTitle}>
                  {Number(lastRun.distance || 0).toFixed(2)} km
                </Text>
                <Text style={styles.lastRunMeta}>
                  {formatRelativeRunDate(lastRun.date)}
                </Text>
                <Text style={styles.lastRunMeta}>
                  {formatClock(lastRun.duration || 0)}
                </Text>
                <Text style={styles.lastRunPace}>
                  {formatPace(lastRun.averagePace || (lastRun.avgSpeed ? 60 / lastRun.avgSpeed : 0))}
                </Text>
              </>
            ) : (
              <Text style={styles.lastRunMeta}>No runs recorded yet</Text>
            )}
          </View>

          <View style={styles.activeTimeCard}>
            <Text style={[styles.cardLabel, {color: Colors.primaryContainer}]}>
              WEEKLY
            </Text>
            <View style={styles.activeTimeValueRow}>
              <Text style={styles.activeTimeValue}>
                {Number(weeklyStats?.totalDistance || 0).toFixed(1)}
              </Text>
              <Text style={styles.activeTimeUnit}>KM</Text>
            </View>
            <ProgressBar
              progress={weeklyGoalProgress}
              color={Colors.primaryContainer}
            />
            <Text style={styles.goalMeta}>
              {(weeklyStats?.totalRuns || 0).toString()} runs this week
            </Text>
          </View>
        </View>

        <View style={styles.previewGrid}>
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>LOCAL TODAY</Text>
            {localToday.length > 0 ? (
              localToday.map((entry, index) => (
                <View key={`${entry.userId}-${index}`} style={styles.previewRow}>
                  <Text style={styles.previewRank}>{entry.rank}</Text>
                  <Text style={styles.previewName} numberOfLines={1}>
                    {entry.name}
                  </Text>
                  <Text style={styles.previewDistance}>
                    {Number(entry.totalDistance || 0).toFixed(1)} km
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.previewEmpty}>Sync location to load nearby ranks.</Text>
            )}
          </View>

          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>CITY WEEK</Text>
            {cityWeekly.length > 0 ? (
              cityWeekly.map((entry, index) => (
                <View key={`${entry.userId}-${index}`} style={styles.previewRow}>
                  <Text style={styles.previewRank}>{entry.rank}</Text>
                  <Text style={styles.previewName} numberOfLines={1}>
                    {entry.name}
                  </Text>
                  <Text style={styles.previewDistance}>
                    {Number(entry.totalDistance || 0).toFixed(1)} km
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.previewEmpty}>Your city board will appear after the first synced run.</Text>
            )}
          </View>
        </View>

        <View style={{height: 120}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  locationBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.surfaceContainerHigh,
    marginBottom: 14,
  },
  locationBadgeText: {
    color: Colors.primaryContainer,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  heroLabel: {
    fontFamily: 'Lexend-Bold',
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  heroValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  heroValue: {
    fontFamily: 'Lexend-Bold',
    fontSize: 98,
    fontWeight: '900',
    color: Colors.onSurface,
    letterSpacing: -4,
    lineHeight: 108,
  },
  heroUnit: {
    fontFamily: 'Lexend-Bold',
    fontSize: 24,
    fontWeight: '700',
    color: Colors.outline,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  rankRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  rankCard: {
    flex: 1,
  },
  rankLabel: {
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  rankValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.tertiaryFixed,
  },
  rankGlobal: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  rankDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.outlineVariant + '4D',
  },
  startRunWrapper: {
    marginBottom: 24,
  },
  startRunButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 82,
    borderRadius: 18,
    paddingHorizontal: 24,
  },
  playCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.onPrimaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    color: Colors.primaryContainer,
    fontSize: 22,
    marginLeft: 3,
  },
  startRunText: {
    flex: 1,
    fontSize: 22,
    fontWeight: '900',
    color: Colors.onPrimaryFixed,
    letterSpacing: -1,
    fontStyle: 'italic',
    textTransform: 'uppercase',
    marginLeft: 16,
  },
  chevron: {
    fontSize: 32,
    color: Colors.onPrimaryFixed + '66',
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 18,
  },
  lastRunCard: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 18,
    padding: 20,
    minHeight: 190,
  },
  activeTimeCard: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 18,
    padding: 20,
    minHeight: 190,
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 10,
    color: Colors.secondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  lastRunTitle: {
    marginTop: 8,
    color: Colors.onSurface,
    fontSize: 22,
    fontWeight: '800',
  },
  lastRunMeta: {
    marginTop: 6,
    color: Colors.onSurfaceVariant,
    fontSize: 12,
  },
  lastRunPace: {
    marginTop: 10,
    color: Colors.primaryContainer,
    fontSize: 14,
    fontWeight: '700',
  },
  activeTimeValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  activeTimeValue: {
    color: Colors.onSurface,
    fontSize: 36,
    fontWeight: '700',
  },
  activeTimeUnit: {
    color: Colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '700',
  },
  goalMeta: {
    marginTop: 8,
    color: Colors.onSurfaceVariant,
    fontSize: 12,
  },
  previewGrid: {
    gap: 14,
  },
  previewCard: {
    borderRadius: 18,
    padding: 18,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '22',
  },
  previewTitle: {
    color: Colors.onSurface,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  previewRank: {
    width: 24,
    color: Colors.primaryContainer,
    fontSize: 12,
    fontWeight: '800',
  },
  previewName: {
    flex: 1,
    color: Colors.onSurface,
    fontSize: 13,
    fontWeight: '600',
  },
  previewDistance: {
    color: Colors.onSurfaceVariant,
    fontSize: 12,
  },
  previewEmpty: {
    color: Colors.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 20,
  },
});

export default HomeScreen;
