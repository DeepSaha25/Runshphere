import React, {useEffect, useMemo, useRef} from 'react';
import {StyleSheet, ViewStyle} from 'react-native';
import MapView, {Marker, Polyline, PROVIDER_GOOGLE} from 'react-native-maps';
import {Colors} from '../theme/colors';
import {RunCoordinate} from '../utils/runMetrics';

interface RouteMapProps {
  coordinates: RunCoordinate[];
  height?: number;
  style?: ViewStyle;
}

const darkMapStyle = [
  {elementType: 'geometry', stylers: [{color: '#0b1323'}]},
  {elementType: 'labels.text.fill', stylers: [{color: '#98A3B3'}]},
  {elementType: 'labels.text.stroke', stylers: [{color: '#0b1323'}]},
  {featureType: 'poi', stylers: [{visibility: 'off'}]},
  {featureType: 'road', elementType: 'geometry', stylers: [{color: '#152238'}]},
  {featureType: 'road', elementType: 'labels.text.fill', stylers: [{color: '#8E99A8'}]},
  {featureType: 'transit', stylers: [{visibility: 'off'}]},
  {featureType: 'water', elementType: 'geometry', stylers: [{color: '#08101d'}]},
];

const defaultRegion = {
  latitude: 28.6139,
  longitude: 77.209,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

const RouteMap: React.FC<RouteMapProps> = ({
  coordinates,
  height = 280,
  style,
}) => {
  const mapRef = useRef<MapView>(null);

  const region = useMemo(() => {
    const latest = coordinates.at(-1);
    if (!latest) {
      return defaultRegion;
    }

    return {
      latitude: latest.latitude,
      longitude: latest.longitude,
      latitudeDelta: 0.008,
      longitudeDelta: 0.008,
    };
  }, [coordinates]);

  useEffect(() => {
    if (!mapRef.current || coordinates.length < 2) {
      return;
    }

    mapRef.current.fitToCoordinates(coordinates, {
      edgePadding: {
        top: 40,
        right: 40,
        bottom: 40,
        left: 40,
      },
      animated: true,
    });
  }, [coordinates]);

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      customMapStyle={darkMapStyle}
      initialRegion={region}
      style={[styles.map, {height}, style]}
      toolbarEnabled={false}
      pitchEnabled={false}
      rotateEnabled={false}
      showsCompass={false}
      showsTraffic={false}
      showsBuildings={false}
      loadingEnabled>
      {coordinates.length > 0 ? (
        <>
          <Polyline
            coordinates={coordinates}
            strokeColor={Colors.neonYellow}
            strokeWidth={4}
          />
          <Marker
            coordinate={coordinates[0]}
            pinColor={Colors.primaryContainer}
            title="Start"
          />
          <Marker
            coordinate={coordinates[coordinates.length - 1]}
            pinColor={Colors.tertiary}
            title="Finish"
          />
        </>
      ) : null}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    borderRadius: 22,
    overflow: 'hidden',
  },
});

export default RouteMap;
