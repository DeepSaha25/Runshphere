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
  status: 'idle' | 'running' | 'paused' | 'summary';
  onPauseResume: () => void;
  onFinish: () => void;
  onCancel: () => void;
}

const mapStyle = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const LiveRunMap = ({
  route,
  elapsedSeconds,
  distanceKm,
  elevationGain,
  calories,
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
                  'line-color': '#000000',
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
                  'line-color': '#111111',
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
                'circle-color': '#18A957',
                'circle-radius': 7,
                'circle-stroke-color': '#FFFFFF',
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
    backgroundColor: '#F6F7F4',
  },
  mapPanel: {
    flex: 1,
    minHeight: 260,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#EDEFEB',
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
    backgroundColor: 'rgba(23,105,255,0.14)',
  },
  markerCore: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#101214',
    borderWidth: 5,
    borderColor: '#FFFFFF',
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
    borderBottomColor: '#2AF598',
  },
  markerCenter: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
  },
  pausedDot: {
    backgroundColor: '#F5A524',
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
    backgroundColor: '#FFFFFF',
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
    color: '#111111',
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '900',
    textAlign: 'center',
  },
  distanceRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  primaryValue: {
    color: '#111111',
    fontSize: 48,
    lineHeight: 52,
    fontWeight: '900',
    textAlign: 'center',
  },
  primaryLabel: {
    marginLeft: 8,
    color: '#747B83',
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
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  statLabel: {
    color: '#7A8088',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  statValue: {
    marginTop: 6,
    color: '#111111',
    fontSize: 20,
    fontWeight: '900',
  },
  statUnit: {
    marginTop: 2,
    color: '#8A9097',
    fontSize: 11,
    fontWeight: '800',
  },
  bottomControls: {
    marginTop: 18,
    minHeight: 72,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.96)',
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
    backgroundColor: '#F2F3F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#42464D',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  primaryButton: {
    flex: 1.2,
    height: 54,
    borderRadius: 19,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeButton: {
    backgroundColor: '#18A957',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  stopButton: {
    flex: 1,
    height: 50,
    borderRadius: 17,
    backgroundColor: '#FFE8E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButtonText: {
    color: '#D93025',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});

export default LiveRunMap;
