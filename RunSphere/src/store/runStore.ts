import {create} from 'zustand';
import {devtools} from 'zustand/middleware';
import {
  RunCoordinate,
  calculateElevationGain,
  calculateRouteDistanceKm,
  shouldAcceptCoordinate,
} from '../utils/runMetrics';

type RunStatus = 'idle' | 'running' | 'paused' | 'summary';

interface RunState {
  status: RunStatus;
  startedAt: string | null;
  finishedAt: string | null;
  elapsedSeconds: number;
  distanceKm: number;
  elevationGain: number;
  coordinates: RunCoordinate[];
  startRun: (seed?: RunCoordinate | null) => void;
  addCoordinate: (coordinate: RunCoordinate) => void;
  tick: () => void;
  pauseRun: () => void;
  resumeRun: () => void;
  prepareSummary: () => void;
  resetRun: () => void;
}

const initialState = {
  status: 'idle' as RunStatus,
  startedAt: null,
  finishedAt: null,
  elapsedSeconds: 0,
  distanceKm: 0,
  elevationGain: 0,
  coordinates: [] as RunCoordinate[],
};

export const useRunStore = create<RunState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      startRun: seed => {
        set({
          ...initialState,
          status: 'running',
          startedAt: seed?.timestamp || new Date().toISOString(),
          coordinates: seed ? [seed] : [],
        });
      },
      addCoordinate: coordinate => {
        const previous = get().coordinates.at(-1) || null;
        if (!shouldAcceptCoordinate(previous, coordinate)) {
          return;
        }

        const coordinates = [...get().coordinates, coordinate];
        set({
          coordinates,
          distanceKm: Math.round(calculateRouteDistanceKm(coordinates) * 100) / 100,
          elevationGain: calculateElevationGain(coordinates),
        });
      },
      tick: () => {
        if (get().status !== 'running') {
          return;
        }

        set(state => ({
          elapsedSeconds: state.elapsedSeconds + 1,
        }));
      },
      pauseRun: () => set({status: 'paused'}),
      resumeRun: () => set({status: 'running'}),
      prepareSummary: () =>
        set({
          status: 'summary',
          finishedAt: new Date().toISOString(),
        }),
      resetRun: () => set(initialState),
    }),
    {name: 'runsphere-run-store'},
  ),
);
