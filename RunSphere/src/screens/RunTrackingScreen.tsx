import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
import RouteMap from '../components/RouteMap';
import {useRunStore} from '../store/runStore';
import {useUserStore} from '../store/userStore';
import {Colors} from '../theme/colors';
import {
  RunCoordinate,
  calculatePaceMinutesPerKm,
  estimateCalories,
  formatClock,
  formatPace,
} from '../utils/runMetrics';
import {
  getCurrentLocation,
  requestLocationPermission,
  startLocationWatch,
  stopLocationWatch,
} from '../utils/location';

const RunTrackingScreen = ({navigation}: any) => {
  const profile = useUserStore(state => state.profile);
  const updateBackendLocation = useUserStore(state => state.updateBackendLocation);
  const status = useRunStore(state => state.status);
  const coordinates = useRunStore(state => state.coordinates);
  const distanceKm = useRunStore(state => state.distanceKm);
  const elapsedSeconds = useRunStore(state => state.elapsedSeconds);
  const elevationGain = useRunStore(state => state.elevationGain);
  const startRun = useRunStore(state => state.startRun);
  const pauseRun = useRunStore(state => state.pauseRun);
  const resumeRun = useRunStore(state => state.resumeRun);
  const addCoordinate = useRunStore(state => state.addCoordinate);
  const tick = useRunStore(state => state.tick);
  const prepareSummary = useRunStore(state => state.prepareSummary);
  const resetRun = useRunStore(state => state.resetRun);
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [locationStatus, setLocationStatus] = useState('Acquiring GPS lock...');

  const clearTrackingArtifacts = useCallback(() => {
    stopLocationWatch(watchIdRef.current);
    watchIdRef.current = null;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const syncLocationToBackend = useCallback(
    async (coordinate: RunCoordinate) => {
      try {
        const updatedProfile = await updateBackendLocation(
          coordinate.latitude,
          coordinate.longitude,
        );
        const city = updatedProfile?.location?.city;
        const state = updatedProfile?.location?.state;
        if (city || state) {
          setLocationStatus(
            [city, state].filter(Boolean).join(', ') || 'GPS locked',
          );
        } else {
          setLocationStatus('GPS locked');
        }
      } catch {
        setLocationStatus('GPS locked');
      }
    },
    [updateBackendLocation],
  );

  const ingestPosition = useCallback(
    async (position: any, syncProfile = false) => {
      const coordinate: RunCoordinate = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        altitude:
          typeof position.coords.altitude === 'number'
            ? position.coords.altitude
            : null,
        timestamp: new Date(position.timestamp || Date.now()).toISOString(),
      };

      const store = useRunStore.getState();
      if (store.status === 'idle') {
        store.startRun(coordinate);
      } else {
        store.addCoordinate(coordinate);
      }

      setLocationStatus('Live GPS tracking');

      if (syncProfile) {
        await syncLocationToBackend(coordinate);
      }
    },
    [syncLocationToBackend],
  );

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      resetRun();

      try {
        const granted = await requestLocationPermission();
        if (!granted) {
          Toast.show({
            type: 'error',
            text1: 'Location permission required',
            text2: 'Enable GPS access to track an outdoor run.',
          });
          navigation.goBack();
          return;
        }

        const currentPosition = await getCurrentLocation();
        if (!active) {
          return;
        }

        await ingestPosition(currentPosition, true);
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Could not start GPS',
          text2: error?.message || 'Please check location services and try again.',
        });
        navigation.goBack();
        return;
      }

      if (active) {
        setInitializing(false);
      }
    };

    bootstrap();

    return () => {
      active = false;
      clearTrackingArtifacts();
    };
  }, [clearTrackingArtifacts, ingestPosition, navigation, resetRun]);

  useEffect(() => {
    if (initializing || status === 'idle' || status === 'summary') {
      clearTrackingArtifacts();
      return;
    }

    if (status === 'paused') {
      clearTrackingArtifacts();
      return;
    }

    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        useRunStore.getState().tick();
      }, 1000);
    }

    if (watchIdRef.current === null) {
      watchIdRef.current = startLocationWatch(
        position => {
          ingestPosition(position);
        },
        () => {
          setLocationStatus('Waiting for stronger GPS signal');
        },
      );
    }

    return undefined;
  }, [clearTrackingArtifacts, ingestPosition, initializing, status, tick]);

  const pauseOrResume = () => {
    if (status === 'running') {
      pauseRun();
      setLocationStatus('Run paused');
      return;
    }

    resumeRun();
    setLocationStatus('Live GPS tracking');
  };

  const discardRun = () => {
    clearTrackingArtifacts();
    resetRun();
    navigation.goBack();
  };

  const finishRun = () => {
    Alert.alert('Finish run?', 'You will review the summary before saving.', [
      {text: 'Keep running', style: 'cancel'},
      {
        text: 'Finish',
        onPress: () => {
          if (distanceKm < 0.2 || elapsedSeconds < 60) {
            Toast.show({
              type: 'error',
              text1: 'Run discarded',
              text2: 'A saved run needs at least 0.2 km and 60 seconds.',
            });
            discardRun();
            return;
          }

          clearTrackingArtifacts();
          prepareSummary();
          navigation.navigate('RunSummary');
        },
      },
    ]);
  };

  const currentPace = calculatePaceMinutesPerKm(distanceKm, elapsedSeconds);
  const calories = estimateCalories(distanceKm, profile?.weightKg);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.surfaceDim} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>Live Tracking</Text>
          <Text style={styles.headerTitle}>RUNNING NOW</Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            Alert.alert('Discard this run?', 'The current tracked route will be lost.', [
              {text: 'Keep', style: 'cancel'},
              {text: 'Discard', style: 'destructive', onPress: discardRun},
            ])
          }>
          <Text style={styles.closeText}>X</Text>
        </TouchableOpacity>
      </View>

      <RouteMap coordinates={coordinates} height={300} />

      <View style={styles.statusBar}>
        {initializing ? (
          <ActivityIndicator size="small" color={Colors.primaryContainer} />
        ) : (
          <View style={styles.statusDot} />
        )}
        <Text style={styles.statusText}>{locationStatus}</Text>
      </View>

      <View style={styles.timerSection}>
        <Text style={styles.timerLabel}>Duration</Text>
        <Text style={styles.timerValue}>{formatClock(elapsedSeconds)}</Text>
      </View>

      <View style={styles.metricGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Distance</Text>
          <Text style={styles.metricValue}>{distanceKm.toFixed(2)} km</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Current Pace</Text>
          <Text style={styles.metricValue}>{formatPace(currentPace)}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Elevation</Text>
          <Text style={styles.metricValue}>{Math.round(elevationGain)} m</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Calories</Text>
          <Text style={styles.metricValue}>{Math.round(calories)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.secondaryControl} onPress={discardRun}>
          <Text style={styles.secondaryControlText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryControl} onPress={pauseOrResume}>
          <Text style={styles.primaryControlText}>
            {status === 'running' ? 'Pause' : 'Resume'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.finishControl} onPress={finishRun}>
          <Text style={styles.finishControlText}>Stop</Text>
        </TouchableOpacity>
      </View>
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
  headerEyebrow: {
    color: Colors.secondary,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  headerTitle: {
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
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primaryContainer,
  },
  statusText: {
    color: Colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '600',
  },
  timerSection: {
    marginTop: 18,
    marginBottom: 16,
  },
  timerLabel: {
    color: Colors.onSurfaceVariant,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  timerValue: {
    color: Colors.onSurface,
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -2,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '47.8%',
    padding: 18,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '22',
  },
  metricLabel: {
    color: Colors.onSurfaceVariant,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  metricValue: {
    marginTop: 10,
    color: Colors.onSurface,
    fontSize: 22,
    fontWeight: '800',
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 24,
  },
  secondaryControl: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  secondaryControlText: {
    color: Colors.onSurface,
    fontSize: 14,
    fontWeight: '700',
  },
  primaryControl: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: Colors.primaryContainer,
  },
  primaryControlText: {
    color: Colors.onPrimaryFixed,
    fontSize: 14,
    fontWeight: '800',
  },
  finishControl: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: Colors.neonYellow,
  },
  finishControlText: {
    color: Colors.brandOnNeon,
    fontSize: 14,
    fontWeight: '900',
  },
});

export default RunTrackingScreen;
