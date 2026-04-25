import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import AppHeader from '../components/AppHeader';
import {useAuthStore} from '../store/authStore';
import {useUserStore} from '../store/userStore';
import {Colors} from '../theme/colors';
import {getCurrentLocation, requestLocationPermission} from '../utils/location';
import {formatPace, formatRunDate} from '../utils/runMetrics';

const ProfileScreen = () => {
  const profile = useUserStore(state => state.profile);
  const stats = useUserStore(state => state.stats);
  const weeklyStats = useUserStore(state => state.weeklyStats);
  const recentRuns = useUserStore(state => state.recentRuns);
  const isLoading = useUserStore(state => state.isLoading);
  const refreshDashboard = useUserStore(state => state.refreshDashboard);
  const updateBackendLocation = useUserStore(state => state.updateBackendLocation);
  const logout = useAuthStore(state => state.logout);
  const [refreshing, setRefreshing] = useState(false);
  const [syncingLocation, setSyncingLocation] = useState(false);

  const loadProfile = useCallback(async () => {
    await refreshDashboard(8);
  }, [refreshDashboard]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadProfile();
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log out?', 'You can sign back in any time.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleSyncLocation = async () => {
    setSyncingLocation(true);

    try {
      const granted = await requestLocationPermission();
      if (!granted) {
        Toast.show({
          type: 'error',
          text1: 'Location permission required',
          text2: 'Enable location access to join local leaderboards.',
        });
        return;
      }

      const position = await getCurrentLocation();
      await updateBackendLocation(
        position.coords.latitude,
        position.coords.longitude,
      );

      Toast.show({
        type: 'success',
        text1: 'Location synced',
        text2: 'Leaderboards will now use your latest position.',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Could not sync location',
        text2: error?.message || 'Please check GPS and try again.',
      });
    } finally {
      setSyncingLocation(false);
    }
  };

  if (isLoading && !profile) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="large" color={Colors.primaryContainer} />
      </View>
    );
  }

  const totalDistance = Number(stats?.totalDistance || profile?.totalDistance || 0);
  const totalRuns = Number(stats?.totalRuns || 0);
  const weeklyDistance = Number(weeklyStats?.totalDistance || 0);
  const bestPace = recentRuns.reduce((best, run) => {
    const current = run.averagePace || (run.avgSpeed ? 60 / run.avgSpeed : 0);
    if (!best || (current && current < best)) {
      return current;
    }
    return best;
  }, 0);
  const weeklyBars = [8.2, 12.4, 5.1, 21.0, 10.2, 15.5, 2.0];
  const maxBar = Math.max(...weeklyBars);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.surface} />
      <AppHeader
        rightElement={
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>LOG OUT</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primaryContainer}
          />
        }>
        <View style={styles.heroSection}>
          <View style={styles.avatarShell}>
            <View style={styles.avatarInner}>
              <Image
                source={{uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDw_zpHZ2KnGIz5vADzzvKqgSwBNlMb_80kQgwpfJ4Wlg5JJfgY6mKT1803P7OdQoQYfrJ8inPARgQBxDfkeHnmb_aUAanvP8kJOmfVRaUVFI1VTO-oWeq3_lcfXr9gu8vtLLU9qIV8CNCjpxHSEphKIHYbHod8mhwEZGNJlYZRyNA0pOvsmyh0_5ckZd3W9hFTfDCmiz3b6ufYPlBXxnH6ytQ6Qf6OfMqo7ErhgEx6U7l-en9ApVOwwUJun1tUeqPQhzSFmzoWUPdj'}}
                style={styles.avatarImage}
              />
            </View>
            <View style={styles.statusBolt} />
          </View>

          <View style={styles.heroCopy}>
            <Text style={styles.tierChip}>ELITE TIER</Text>
            <Text style={styles.nameText}>{profile?.name || 'Runner'}</Text>
            <Text style={styles.heroMeta}>
              {profile?.location?.city
                ? `${profile.location.city}, ${profile.location.state || ''}`
                : 'Location not synced'}
            </Text>
            <Text style={styles.heroMeta}>
              Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'recently'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.locationButton}
          onPress={handleSyncLocation}
          disabled={syncingLocation}>
          <Text style={styles.locationButtonText}>
            {syncingLocation ? 'SYNCING GPS' : 'SYNC LOCATION'}
          </Text>
        </TouchableOpacity>

        <View style={styles.statsGrid}>
          <View style={styles.heroStat}>
            <Text style={styles.statKicker}>LIFETIME DISTANCE</Text>
            <Text style={styles.heroStatValue}>
              {totalDistance.toFixed(0)} <Text style={styles.heroStatUnit}>KM</Text>
            </Text>
            <Text style={styles.statTrend}>{weeklyDistance.toFixed(1)} km this week</Text>
          </View>

          <View style={styles.miniGrid}>
            <View style={styles.miniCard}>
              <Text style={styles.miniLabel}>FASTEST 5K</Text>
              <Text style={styles.miniValue}>
                {bestPace ? formatPace(bestPace) : '--'}
              </Text>
              <Text style={styles.miniHint}>BEST PACE</Text>
            </View>
            <View style={styles.miniCard}>
              <Text style={styles.miniLabel}>STREAK</Text>
              <Text style={styles.miniValue}>{profile?.streak || 0} DAYS</Text>
              <Text style={styles.miniHint}>CURRENT RUN</Text>
            </View>
            <View style={styles.miniCard}>
              <Text style={styles.miniLabel}>AVG PACE</Text>
              <Text style={styles.miniValue}>
                {stats?.averagePace ? formatPace(stats.averagePace) : '--'}
              </Text>
              <Text style={styles.miniHint}>STEADY CLIMB</Text>
            </View>
            <View style={styles.miniCard}>
              <Text style={styles.miniLabel}>RUNS</Text>
              <Text style={styles.miniValue}>{totalRuns}</Text>
              <Text style={styles.miniHint}>TOTAL SESSIONS</Text>
            </View>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartKicker}>PERFORMANCE VIEW</Text>
          <Text style={styles.chartTitle}>Weekly Volume</Text>
          <View style={styles.barRow}>
            {weeklyBars.map((value, index) => (
              <View key={index} style={styles.barColumn}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${Math.max(12, (value / maxBar) * 100)}%`,
                      backgroundColor: index === 3 ? Colors.primary : Colors.primary + '33',
                    },
                  ]}
                />
                <Text style={[styles.barLabel, index === 3 && styles.barLabelActive]}>
                  {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][index]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.achievementsCard}>
          <Text style={styles.chartTitle}>Kinetic Achievements</Text>
          <View style={styles.achievementGrid}>
            {[
              ['CENTURY CLUB', '100 runs completed'],
              ['SONIC BOOM', 'Sub 4:00 pace 5K'],
              ['APEX HUNTER', '10,000m elevation'],
              ['MARATHONER', 'Locked: 42.2K run'],
            ].map(([title, desc]) => (
              <View key={title} style={styles.achievementItem}>
                <View style={styles.achievementOrb} />
                <Text style={styles.achievementTitle}>{title}</Text>
                <Text style={styles.achievementDesc}>{desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.runsSection}>
          <Text style={styles.chartTitle}>Recent Runs</Text>
          {recentRuns.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptySectionText}>
                Your latest runs will appear here after the first saved route.
              </Text>
            </View>
          ) : (
            recentRuns.slice(0, 4).map((run, index) => (
              <View key={`${run._id || run.date}-${index}`} style={styles.runRow}>
                <View>
                  <Text style={styles.runDistance}>
                    {Number(run.distance || 0).toFixed(2)} km
                  </Text>
                  <Text style={styles.runDate}>{formatRunDate(run.date)}</Text>
                </View>
                <View style={styles.runMeta}>
                  <Text style={styles.runPace}>
                    {formatPace(run.averagePace || (run.avgSpeed ? 60 / run.avgSpeed : 0))}
                  </Text>
                  <Text style={styles.runLocation}>
                    {run.location?.city || 'Outdoor'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.footerSpace} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.surface},
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  content: {paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24},
  logoutText: {
    color: Colors.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  heroSection: {
    gap: 20,
    marginBottom: 18,
  },
  avatarShell: {
    width: 192,
    height: 192,
    borderRadius: 999,
    alignSelf: 'center',
    backgroundColor: Colors.primary,
    padding: 5,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.onSurface,
    fontFamily: 'Lexend-Bold',
    fontSize: 44,
    fontWeight: '900',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  statusBolt: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: Colors.secondary,
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  heroCopy: {
    alignItems: 'center',
  },
  tierChip: {
    backgroundColor: Colors.tertiaryContainer + '26',
    color: Colors.tertiary,
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  nameText: {
    marginTop: 14,
    color: Colors.onSurface,
    fontFamily: 'Lexend-Bold',
    fontSize: 50,
    fontWeight: '900',
    fontStyle: 'italic',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  heroMeta: {
    marginTop: 6,
    color: Colors.onSurfaceVariant,
    fontSize: 13,
  },
  locationButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingVertical: 14,
    backgroundColor: Colors.surfaceContainerHigh,
    marginBottom: 18,
  },
  locationButtonText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  statsGrid: {
    gap: 16,
    marginBottom: 20,
  },
  heroStat: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 32,
    padding: 28,
  },
  statKicker: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  heroStatValue: {
    marginTop: 10,
    color: Colors.onSurface,
    fontFamily: 'Lexend-Bold',
    fontSize: 56,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -3,
  },
  heroStatUnit: {
    color: Colors.primary,
    fontSize: 20,
  },
  statTrend: {
    marginTop: 8,
    color: Colors.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  miniGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  miniCard: {
    width: '47.8%',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 22,
    padding: 18,
  },
  miniLabel: {
    color: Colors.onSurfaceVariant,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  miniValue: {
    marginTop: 10,
    color: Colors.onSurface,
    fontFamily: 'Lexend-Bold',
    fontSize: 24,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  miniHint: {
    marginTop: 8,
    color: Colors.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '700',
  },
  chartCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 32,
    padding: 28,
    marginBottom: 18,
  },
  chartKicker: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  chartTitle: {
    marginTop: 6,
    color: Colors.onSurface,
    fontFamily: 'Lexend-Bold',
    fontSize: 28,
    fontWeight: '800',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 180,
    gap: 8,
  },
  barColumn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  barLabel: {
    marginTop: 12,
    color: Colors.onSurfaceVariant,
    fontSize: 10,
    fontWeight: '800',
  },
  barLabelActive: {
    color: Colors.primary,
  },
  achievementsCard: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 24,
    padding: 22,
    marginBottom: 18,
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementItem: {
    width: '47.8%',
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  achievementOrb: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: Colors.primary + '22',
    marginBottom: 12,
  },
  achievementTitle: {
    color: Colors.onSurface,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  achievementDesc: {
    marginTop: 6,
    color: Colors.onSurfaceVariant,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  runsSection: {
    marginBottom: 18,
  },
  emptySection: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerLow,
  },
  emptySectionText: {
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
  },
  runRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 22,
    backgroundColor: Colors.surfaceContainerHigh,
    marginBottom: 10,
  },
  runDistance: {
    color: Colors.onSurface,
    fontSize: 18,
    fontWeight: '800',
  },
  runDate: {
    marginTop: 4,
    color: Colors.onSurfaceVariant,
    fontSize: 12,
  },
  runMeta: {
    alignItems: 'flex-end',
  },
  runPace: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  runLocation: {
    marginTop: 4,
    color: Colors.onSurfaceVariant,
    fontSize: 12,
  },
  footerSpace: {
    height: 120,
  },
});

export default ProfileScreen;
