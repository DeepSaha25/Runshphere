import React, {useEffect, useMemo, useRef} from 'react';
import {StyleSheet, ViewStyle} from 'react-native';
import {
  Camera,
  CameraRef,
  GeoJSONSource,
  Layer,
  Map,
} from '@maplibre/maplibre-react-native';
import type {Feature, FeatureCollection, LineString, Point} from 'geojson';
import {Colors} from '../theme/colors';
import {RunCoordinate} from '../utils/runMetrics';

interface RouteMapProps {
  coordinates: RunCoordinate[];
  height?: number;
  style?: ViewStyle;
}

const mapStyle = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const emptyLine: Feature<LineString> = {
  type: 'Feature',
  properties: {},
  geometry: {type: 'LineString', coordinates: []},
};

const emptyPoints: FeatureCollection<Point> = {
  type: 'FeatureCollection',
  features: [],
};

const anonymizeCoordinate = (coordinate: RunCoordinate): RunCoordinate => ({
  ...coordinate,
  latitude: Number(coordinate.latitude.toFixed(3)),
  longitude: Number(coordinate.longitude.toFixed(3)),
});

const toLngLat = (point: RunCoordinate): [number, number] => [
  point.longitude,
  point.latitude,
];

const RouteMap = ({coordinates, height = 280, style}: RouteMapProps) => {
  const cameraRef = useRef<CameraRef>(null);

  const route = useMemo(
    () => coordinates.map(anonymizeCoordinate),
    [coordinates],
  );

  const line = useMemo<Feature<LineString>>(() => {
    if (route.length < 2) {
      return emptyLine;
    }

    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: route.map(toLngLat),
      },
    };
  }, [route]);

  const points = useMemo<FeatureCollection<Point>>(() => {
    if (route.length === 0) {
      return emptyPoints;
    }

    const start = route[0];
    const end = route[route.length - 1];

    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {kind: 'start'},
          geometry: {type: 'Point', coordinates: toLngLat(start)},
        },
        {
          type: 'Feature',
          properties: {kind: 'end'},
          geometry: {type: 'Point', coordinates: toLngLat(end)},
        },
      ],
    };
  }, [route]);

  useEffect(() => {
    if (route.length === 0) {
      return;
    }

    if (route.length === 1) {
      cameraRef.current?.easeTo({
        center: toLngLat(route[0]),
        zoom: 14,
        duration: 500,
      });
      return;
    }

    const longitudes = route.map(point => point.longitude);
    const latitudes = route.map(point => point.latitude);

    cameraRef.current?.fitBounds(
      [
        Math.min(...longitudes),
        Math.min(...latitudes),
        Math.max(...longitudes),
        Math.max(...latitudes),
      ],
      {
        padding: {top: 52, right: 52, bottom: 52, left: 52},
        duration: 800,
      },
    );
  }, [route]);

  return (
    <Map
      mapStyle={mapStyle}
      style={[styles.map, {height}, style]}
      attribution={false}
      logo={false}
      compass={false}
      scaleBar={false}
      dragPan
      touchZoom
      touchPitch={false}
      touchRotate={false}>
      <Camera
        ref={cameraRef}
        initialViewState={{
          center: route[0] ? toLngLat(route[0]) : [78.9629, 20.5937],
          zoom: route[0] ? 14 : 4,
        }}
      />

      <GeoJSONSource id="summary-route-source" data={line}>
        <Layer
          id="summary-route-line"
          type="line"
          layout={{
            'line-cap': 'round',
            'line-join': 'round',
          }}
          paint={{
            'line-color': Colors.primary,
            'line-width': 5,
          }}
        />
      </GeoJSONSource>

      <GeoJSONSource id="summary-route-points" data={points}>
        <Layer
          id="summary-start-point"
          type="circle"
          filter={['==', ['get', 'kind'], 'start']}
          paint={{
            'circle-color': '#18A957',
            'circle-radius': 7,
            'circle-stroke-color': '#FFFFFF',
            'circle-stroke-width': 3,
          }}
        />
        <Layer
          id="summary-end-point"
          type="circle"
          filter={['==', ['get', 'kind'], 'end']}
          paint={{
            'circle-color': '#D93025',
            'circle-radius': 7,
            'circle-stroke-color': '#FFFFFF',
            'circle-stroke-width': 3,
          }}
        />
      </GeoJSONSource>
    </Map>
  );
};

const styles = StyleSheet.create({
  map: {
    borderRadius: 22,
    overflow: 'hidden',
  },
});

export default RouteMap;
