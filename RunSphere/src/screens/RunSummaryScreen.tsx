import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import GradientButton from '../components/GradientButton';
import RouteMap from '../components/RouteMap';
import RunService from '../services/runService';
import {useLeaderboardStore} from '../store/leaderboardStore';
import {useRunStore} from '../store/runStore';
import {useUserStore} from '../store/userStore';
import {Colors} from '../theme/colors';
import {
  calculatePaceMinutesPerKm,
  estimateCalories,
  formatClock,
  formatPace,
} from '../utils/runMetrics';

const RunSummaryScreen = ({navigation}: any) => {
  const [saving, setSaving] = useState(false);
  const profile = useUserStore(state => state.profile);
  const refreshDashboard = useUserStore(state => state.refreshDashboard);
  const loadLeaderboard = useLeaderboardStore(state => state.loadLeaderboard);
  const resetRun = useRunStore(state => state.resetRun);
  const coordinates = useRunStore(state => state.coordinates);
  const distanceKm = useRunStore(state => state.distanceKm);
  const elapsedSeconds = useRunStore(state => state.elapsedSeconds);
  const elevationGain = useRunStore(state => state.elevationGain);
  const finishedAt = useRunStore(state => state.finishedAt);

  const summary = useMemo(() => {
    const averagePace = calculatePaceMinutesPerKm(distanceKm, elapsedSeconds);

    return {
      distanceKm,
      elapsedSeconds,
      elevationGain,
      averagePace,
      caloriesBurned: estimateCalories(distanceKm, profile?.weightKg),
      finishedAt: finishedAt || new Date().toISOString(),
    };
  }, [distanceKm, elapsedSeconds, elevationGain, finishedAt, profile?.weightKg]);

  const discardRun = () => {
    resetRun();
    navigation.reset({
      index: 0,
      routes: [{name: 'Main'}],
    });
  };

  const saveRun = async () => {
    if (coordinates.length === 0 || distanceKm < 0.2) {
      Toast.show({
        type: 'error',
        text1: 'Run is too short',
        text2: 'Track at least 0.2 km before saving a run.',
      });
      return;
    }

    setSaving(true);
    try {
      await RunService.submitRun({
        distance: Number(summary.distanceKm.toFixed(2)),
        duration: summary.elapsedSeconds,
        coordinates,
        elevationGain: summary.elevationGain,
        caloriesBurned: summary.caloriesBurned,
        date: summary.finishedAt,
      });

      await Promise.all([
        refreshDashboard(20),
        loadLeaderboard('local', 'today', 6),
        loadLeaderboard('city', 'weekly', 6),
      ]);

      resetRun();

      Toast.show({
        type: 'success',
        text1: 'Run saved',
        text2: 'Your stats and leaderboards have been updated.',
      });

      navigation.reset({
        index: 0,
        routes: [{name: 'Main'}],
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Could not save run',
        text2: error?.message || 'Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.surfaceDim} />

      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Run Summary</Text>
          <Text style={styles.title}>OWNED THE CITY</Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            Alert.alert('Discard this run?', 'The tracked route will be removed.', [
              {text: 'Keep', style: 'cancel'},
              {text: 'Discard', style: 'destructive', onPress: discardRun},
            ])
          }>
          <Text style={styles.closeText}>X</Text>
        </TouchableOpacity>
      </View>

      <RouteMap coordinates={coordinates} height={300} />

      <View style={styles.heroMetrics}>
        <View>
          <Text style={styles.distanceValue}>{summary.distanceKm.toFixed(2)}</Text>
          <Text style={styles.distanceLabel}>KM COMPLETED</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{formatPace(summary.averagePace)}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Duration</Text>
          <Text style={styles.cardValue}>{formatClock(summary.elapsedSeconds)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Calories</Text>
          <Text style={styles.cardValue}>{Math.round(summary.caloriesBurned)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Elevation</Text>
          <Text style={styles.cardValue}>{Math.round(summary.elevationGain)} m</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Route Points</Text>
          <Text style={styles.cardValue}>{coordinates.length}</Text>
        </View>
      </View>

      {saving ? (
        <ActivityIndicator
          size="large"
          color={Colors.primaryContainer}
          style={{marginTop: 28}}
        />
      ) : (
        <View style={styles.actions}>
          <GradientButton title="Save Run" onPress={saveRun} style={styles.saveButton} />
          <TouchableOpacity style={styles.secondaryButton} onPress={discardRun}>
            <Text style={styles.secondaryButtonText}>Discard</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingTop: 52,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  eyebrow: {
    color: Colors.secondary,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 6,
    color: Colors.onSurface,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  closeText: {
    color: Colors.onSurfaceVariant,
    fontSize: 18,
    fontWeight: '700',
  },
  heroMetrics: {
    marginTop: 20,
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  distanceValue: {
    color: Colors.onSurface,
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: -3,
  },
  distanceLabel: {
    marginTop: -2,
    color: Colors.onSurfaceVariant,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  badgeText: {
    color: Colors.primaryContainer,
    fontSize: 13,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  card: {
    width: '47.8%',
    padding: 18,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '22',
  },
  cardLabel: {
    color: Colors.onSurfaceVariant,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  cardValue: {
    marginTop: 10,
    color: Colors.onSurface,
    fontSize: 22,
    fontWeight: '800',
  },
  actions: {
    marginTop: 30,
    marginBottom: 24,
  },
  saveButton: {
    marginBottom: 12,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  secondaryButtonText: {
    color: Colors.onSurface,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default RunSummaryScreen;
