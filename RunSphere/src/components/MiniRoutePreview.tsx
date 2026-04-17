import React, {useMemo, useState} from 'react';
import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {Colors} from '../theme/colors';
import {RunCoordinate} from '../utils/runMetrics';

interface MiniRoutePreviewProps {
  coordinates: RunCoordinate[];
  style?: ViewStyle;
}

interface Point {
  x: number;
  y: number;
}

const PADDING = 12;

const MiniRoutePreview: React.FC<MiniRoutePreviewProps> = ({
  coordinates,
  style,
}) => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const projectedPoints = useMemo(() => {
    if (width === 0 || height === 0 || coordinates.length === 0) {
      return [] as Point[];
    }

    const latitudes = coordinates.map(point => point.latitude);
    const longitudes = coordinates.map(point => point.longitude);
    const minLatitude = Math.min(...latitudes);
    const maxLatitude = Math.max(...latitudes);
    const minLongitude = Math.min(...longitudes);
    const maxLongitude = Math.max(...longitudes);
    const usableWidth = width - PADDING * 2;
    const usableHeight = height - PADDING * 2;

    return coordinates.map(point => ({
      x:
        PADDING +
        ((point.longitude - minLongitude) / (maxLongitude - minLongitude || 1)) *
          usableWidth,
      y:
        PADDING +
        (1 - (point.latitude - minLatitude) / (maxLatitude - minLatitude || 1)) *
          usableHeight,
    }));
  }, [coordinates, height, width]);

  const handleLayout = ({nativeEvent}: LayoutChangeEvent) => {
    setWidth(nativeEvent.layout.width);
    setHeight(nativeEvent.layout.height);
  };

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      {projectedPoints.length < 2 ? (
        <Text style={styles.emptyText}>ROUTE PREVIEW</Text>
      ) : (
        <>
          {projectedPoints.slice(0, -1).map((point, index) => {
            const nextPoint = projectedPoints[index + 1];
            const deltaX = nextPoint.x - point.x;
            const deltaY = nextPoint.y - point.y;
            const lineLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const angle = `${Math.atan2(deltaY, deltaX)}rad`;
            const midX = point.x + deltaX / 2;
            const midY = point.y + deltaY / 2;

            return (
              <View
                key={`segment-${index}`}
                style={[
                  styles.segment,
                  {
                    left: midX - lineLength / 2,
                    top: midY,
                    width: lineLength,
                    transform: [{rotateZ: angle}],
                  },
                ]}
              />
            );
          })}
          {projectedPoints.map((point, index) => (
            <View
              key={`point-${index}`}
              style={[
                styles.point,
                index === 0 && styles.startPoint,
                index === projectedPoints.length - 1 && styles.endPoint,
                {
                  left: point.x - 3,
                  top: point.y - 3,
                },
              ]}
            />
          ))}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 90,
    borderRadius: 16,
    backgroundColor: '#0B1223',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '33',
  },
  emptyText: {
    color: Colors.onSurfaceVariant,
    fontSize: 10,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 34,
  },
  segment: {
    position: 'absolute',
    height: 2,
    backgroundColor: Colors.neonYellow,
    borderRadius: 999,
  },
  point: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.neonYellow,
  },
  startPoint: {
    backgroundColor: Colors.primaryContainer,
  },
  endPoint: {
    backgroundColor: Colors.tertiary,
  },
});

export default MiniRoutePreview;
