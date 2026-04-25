import {useEffect, useMemo, useState} from 'react';
import type {Feature, FeatureCollection, LineString, Point} from 'geojson';
import {RunCoordinate} from '../utils/runMetrics';

const emptyRoute: Feature<LineString> = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'LineString',
    coordinates: [],
  },
};

const emptyPoints: FeatureCollection<Point> = {
  type: 'FeatureCollection',
  features: [],
};

const toLngLat = (point: RunCoordinate): [number, number] => [
  point.longitude,
  point.latitude,
];

export const useThrottledRouteGeoJSON = (
  route: RunCoordinate[],
  throttleMs = 1000,
) => {
  const [visibleRoute, setVisibleRoute] = useState(route);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setVisibleRoute(route);
    }, throttleMs);

    return () => clearTimeout(timeoutId);
  }, [route, throttleMs]);

  const line = useMemo<Feature<LineString>>(() => {
    if (visibleRoute.length < 2) {
      return emptyRoute;
    }

    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: visibleRoute.map(toLngLat),
      },
    };
  }, [visibleRoute]);

  const points = useMemo<FeatureCollection<Point>>(() => {
    if (visibleRoute.length === 0) {
      return emptyPoints;
    }

    const start = visibleRoute[0];
    const latest = visibleRoute[visibleRoute.length - 1];
    const features: Feature<Point>[] = [
      {
        type: 'Feature',
        properties: {kind: 'start'},
        geometry: {type: 'Point', coordinates: toLngLat(start)},
      },
      {
        type: 'Feature',
        properties: {kind: 'current'},
        geometry: {type: 'Point', coordinates: toLngLat(latest)},
      },
    ];

    return {
      type: 'FeatureCollection',
      features,
    };
  }, [visibleRoute]);

  return {line, points, latest: visibleRoute.at(-1) || null};
};
