import React, {useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Camera,
  CameraRef,
  GeoJSONSource,
  Layer,
  Map,
  Marker,
} from '@maplibre/maplibre-react-native';
import {Colors} from '../theme/colors';
import {
  RunCoordinate,
  calculatePaceMinutesPerKm,
  estimateCalories,
  formatClock,
  formatPace,
} from '../utils/runMetrics';
import {useThrottledRouteGeoJSON} from '../hooks/useThrottledRouteGeoJSON';

interface LiveRunMapProps {
  route: RunCoordinate[];
  elapsedSeconds: number;
  distanceKm: number;
  elevationGain: number;
  calories?: number;
  gpsStatus?: string;
  status: 'idle' | 'running' | 'paused' | 'summary';
  onPauseResume: () => void;
  onFinish: () => void;
  onCancel: () => void;
}

const mapStyle = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const LiveRunMap = ({
  route,
  elapsedSeconds,
  distanceKm,
  elevationGain,
  calories,
  gpsStatus,
  status,
  onPauseResume,
  onFinish,
  onCancel,
}: LiveRunMapProps) => {
  const cameraRef = useRef<CameraRef>(null);
  const {line, points, latest} = useThrottledRouteGeoJSON(route, 1000);
  const isPaused = status === 'paused';
  const hasRouteLine = route.length >= 2;
  const currentPace = calculatePaceMinutesPerKm(distanceKm, elapsedSeconds);
  const caloriesBurned = calories ?? estimateCalories(distanceKm);

  useEffect(() => {
    if (!latest) {
      return;
    }

    cameraRef.current?.easeTo({
      center: [latest.longitude, latest.latitude],
      zoom: 16.5,
      pitch: 0,
      bearing: 0,
      duration: 900,
    });
  }, [latest]);

  return (
    <View style={styles.container}>
      <View style={styles.mapPanel}>
        <Map
          mapStyle={mapStyle}
          style={styles.map}
          attribution={false}
          logo={false}
          compass={false}
          scaleBar={false}
          touchPitch={false}
          touchRotate={false}>
          <Camera
            ref={cameraRef}
            initialViewState={{
              center: latest
                ? [latest.longitude, latest.latitude]
                : [78.9629, 20.5937],
              zoom: latest ? 16.5 : 4,
            }}
            minZoom={3}
            maxZoom={20}
          />

          {hasRouteLine ? (
            <GeoJSONSource id="route-source" data={line} lineMetrics>
              <Layer
                id="route-glow"
                type="line"
                layout={{
                  'line-cap': 'round',
                  'line-join': 'round',
                }}
                paint={{
                  'line-color': Colors.primary,
                  'line-width': 10,
                  'line-opacity': 0.12,
                }}
              />
              <Layer
                id="route-line"
                type="line"
                layout={{
                  'line-cap': 'round',
                  'line-join': 'round',
                }}
                paint={{
                  'line-color': Colors.primaryContainer,
                  'line-width': 5,
                }}
              />
            </GeoJSONSource>
          ) : null}

          <GeoJSONSource id="route-points-source" data={points}>
            <Layer
              id="start-point"
              type="circle"
              filter={['==', ['get', 'kind'], 'start']}
              paint={{
                'circle-color': Colors.secondary,
                'circle-radius': 7,
                'circle-stroke-color': Colors.onSurface,
                'circle-stroke-width': 3,
              }}
            />
          </GeoJSONSource>

          {latest ? (
            <Marker
              id="current-location-marker"
              lngLat={[latest.longitude, latest.latitude]}
              anchor="center">
              <View style={styles.locationMarker}>
                <View style={styles.markerHalo} />
                <View style={styles.markerCore}>
                  <View style={styles.markerArrow} />
                  <View style={styles.markerCenter} />
                </View>
              </View>
            </Marker>
          ) : null}
        </Map>
      </View>

      <View style={styles.statsPanel}>
        <View style={styles.heroCard}>
          <Text style={styles.gpsStatus}>{gpsStatus || 'GPS ready'}</Text>
          <Text style={styles.timer}>{formatClock(elapsedSeconds)}</Text>
          <View style={styles.distanceRow}>
            <Text style={styles.primaryValue}>{distanceKm.toFixed(2)}</Text>
            <Text style={styles.primaryLabel}>km</Text>
          </View>
        </View>

        <View style={styles.statGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pace</Text>
            <Text style={styles.statValue}>{formatPace(currentPace).replace(' /km', '')}</Text>
            <Text style={styles.statUnit}>/km</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Calories</Text>
            <Text style={styles.statValue}>{Math.round(caloriesBurned)}</Text>
            <Text style={styles.statUnit}>kcal</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Climb</Text>
            <Text style={styles.statValue}>{Math.round(elevationGain)}</Text>
            <Text style={styles.statUnit}>m</Text>
          </View>
        </View>

        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryButton, isPaused && styles.resumeButton]}
            onPress={onPauseResume}>
            <Text style={styles.primaryButtonText}>
              {isPaused ? 'Resume' : 'Pause'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.stopButton} onPress={onFinish}>
            <Text style={styles.stopButtonText}>Stop</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  mapPanel: {
    flex: 1,
    minHeight: 260,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceContainerLow,
  },
  map: {
    flex: 1,
  },
  locationMarker: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerHalo: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.primary + '22',
  },
  markerCore: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surface,
    borderWidth: 5,
    borderColor: Colors.onSurface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  markerArrow: {
    position: 'absolute',
    top: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 22,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.secondary,
  },
  markerCenter: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: Colors.onSurface,
  },
  pausedDot: {
    backgroundColor: Colors.tertiary,
  },
  statsPanel: {
    flexShrink: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    justifyContent: 'flex-start',
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 8,
  },
  timer: {
    color: Colors.onSurface,
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '900',
    textAlign: 'center',
  },
  gpsStatus: {
    color: Colors.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  distanceRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  primaryValue: {
    color: Colors.onSurface,
    fontSize: 48,
    lineHeight: 52,
    fontWeight: '900',
    textAlign: 'center',
  },
  primaryLabel: {
    marginLeft: 8,
    color: Colors.onSurfaceVariant,
    fontSize: 18,
    fontWeight: '900',
  },
  statGrid: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    minHeight: 82,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerHigh,
    padding: 12,
  },
  statLabel: {
    color: Colors.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  statValue: {
    marginTop: 6,
    color: Colors.onSurface,
    fontSize: 20,
    fontWeight: '900',
  },
  statUnit: {
    marginTop: 2,
    color: Colors.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '800',
  },
  bottomControls: {
    marginTop: 18,
    minHeight: 72,
    borderRadius: 28,
    backgroundColor: Colors.surfaceContainerHigh,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.14,
    shadowRadius: 26,
    elevation: 14,
  },
  secondaryButton: {
    flex: 1,
    height: 50,
    borderRadius: 17,
    backgroundColor: Colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: Colors.onSurfaceVariant,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  primaryButton: {
    flex: 1.2,
    height: 54,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeButton: {
    backgroundColor: Colors.secondary,
  },
  primaryButtonText: {
    color: Colors.onPrimaryFixed,
    fontSize: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  stopButton: {
    flex: 1,
    height: 50,
    borderRadius: 17,
    backgroundColor: Colors.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButtonText: {
    color: Colors.onErrorContainer,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});

export default LiveRunMap;
