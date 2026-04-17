import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
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
import ProgressBar from '../components/ProgressBar';
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
  const bestPace = recentRuns.reduce((best, run) => {
    const current = run.averagePace || (run.avgSpeed ? 60 / run.avgSpeed : 0);
    if (!best || (current && current < best)) {
      return current;
    }
    return best;
  }, 0);
  const initials = profile?.name
    ? profile.name
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
    : 'RS';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.surfaceDim} />
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
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>

          <View style={styles.nameBlock}>
            <Text style={styles.nameText}>{profile?.name || 'Runner'}</Text>
            <Text style={styles.emailText}>{profile?.email}</Text>
            <Text style={styles.locationText}>
              {profile?.location?.city
                ? `${profile.location.city}, ${profile.location.state || ''}`
                : 'Location not synced'}
            </Text>
          </View>

          <View style={styles.streakCard}>
            <Text style={styles.streakValue}>{profile?.streak || 0}</Text>
            <Text style={styles.streakLabel}>DAY STREAK</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.locationButton}
          onPress={handleSyncLocation}
          disabled={syncingLocation}>
          <Text style={styles.locationButtonText}>
            {syncingLocation ? 'SYNCING GPS...' : 'SYNC LOCATION'}
          </Text>
        </TouchableOpacity>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardWide]}>
            <Text style={styles.statLabel}>Lifetime Distance</Text>
            <Text style={styles.statValueLarge}>{totalDistance.toFixed(1)}</Text>
            <Text style={styles.statUnit}>KM</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Weekly Goal</Text>
            <Text style={styles.statValueMedium}>
              {Number(weeklyStats?.totalDistance || 0).toFixed(1)} / 25
            </Text>
            <ProgressBar
              progress={Math.min(100, ((weeklyStats?.totalDistance || 0) / 25) * 100)}
              color={Colors.secondary}
            />
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Runs</Text>
            <Text style={styles.statValueMedium}>{totalRuns}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PERFORMANCE SNAPSHOT</Text>
          <View style={styles.snapshotRow}>
            <View style={styles.snapshotCard}>
              <Text style={styles.snapshotLabel}>Best Pace</Text>
              <Text style={styles.snapshotValue}>{formatPace(bestPace)}</Text>
            </View>
            <View style={styles.snapshotCard}>
              <Text style={styles.snapshotLabel}>Calories Burned</Text>
              <Text style={styles.snapshotValue}>
                {Math.round(stats?.caloriesBurned || 0)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECENT RUNS</Text>
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

        <View style={{height: 120}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceDim,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceDim,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  logoutText: {
    color: Colors.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  heroSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  avatarShell: {
    width: 92,
    height: 92,
    borderRadius: 46,
    padding: 3,
    backgroundColor: Colors.primaryContainer,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 44,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.primaryContainer,
    fontSize: 28,
    fontWeight: '900',
  },
  nameBlock: {
    flex: 1,
    minWidth: 180,
  },
  nameText: {
    color: Colors.onSurface,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -1,
  },
  emailText: {
    marginTop: 4,
    color: Colors.onSurfaceVariant,
    fontSize: 14,
  },
  locationText: {
    marginTop: 6,
    color: Colors.secondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  streakCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(20,31,56,0.7)',
  },
  streakValue: {
    color: Colors.neonYellow,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  streakLabel: {
    color: Colors.onSurfaceVariant,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  locationButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingVertical: 14,
    backgroundColor: Colors.surfaceContainerHigh,
    marginBottom: 18,
  },
  locationButtonText: {
    color: Colors.primaryContainer,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(20,31,56,0.72)',
    borderRadius: 20,
    padding: 20,
  },
  statCardWide: {
    minWidth: '100%',
  },
  statLabel: {
    color: Colors.onSurfaceVariant,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  statValueLarge: {
    marginTop: 12,
    color: Colors.primaryContainer,
    fontSize: 54,
    fontWeight: '900',
    letterSpacing: -2,
  },
  statUnit: {
    color: Colors.onSurfaceVariant,
    fontSize: 18,
    fontWeight: '700',
  },
  statValueMedium: {
    marginTop: 12,
    marginBottom: 12,
    color: Colors.onSurface,
    fontSize: 28,
    fontWeight: '800',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 14,
    color: Colors.onSurface,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  snapshotRow: {
    flexDirection: 'row',
    gap: 12,
  },
  snapshotCard: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerLow,
  },
  snapshotLabel: {
    color: Colors.onSurfaceVariant,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  snapshotValue: {
    marginTop: 10,
    color: Colors.onSurface,
    fontSize: 20,
    fontWeight: '800',
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
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerLow,
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
    color: Colors.primaryContainer,
    fontSize: 14,
    fontWeight: '700',
  },
  runLocation: {
    marginTop: 4,
    color: Colors.onSurfaceVariant,
    fontSize: 12,
  },
});

export default ProfileScreen;
