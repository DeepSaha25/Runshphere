import { create } from 'zustand';
import LeaderboardService, {
  LeaderboardLevel,
  TimePeriod,
} from '../services/leaderboardService';
import { ApiError } from '../services/apiClient';
import { isGuestUser } from '../services/guestSession';
import { useAuthStore } from './authStore';

type Key = `${LeaderboardLevel}:${TimePeriod}`;

interface LeaderboardState {
  entries: Partial<Record<Key, any[]>>;
  ranks: Partial<Record<Key, number | null>>;
  loading: Partial<Record<Key, boolean>>;
  errors: Partial<Record<Key, string | null>>;
  loadLeaderboard: (
    scope: LeaderboardLevel,
    period: TimePeriod,
    limit?: number,
  ) => Promise<void>;
  getEntries: (scope: LeaderboardLevel, period: TimePeriod) => any[];
  getRank: (scope: LeaderboardLevel, period: TimePeriod) => number | null;
  reset: () => void;
}

const getKey = (scope: LeaderboardLevel, period: TimePeriod) =>
  `${scope}:${period}` as Key;

export const useLeaderboardStore = create<LeaderboardState>()((set, get) => ({
  entries: {},
  ranks: {},
  loading: {},
  errors: {},
  loadLeaderboard: async (scope, period, limit = 25) => {
    const key = getKey(scope, period);
    set(state => ({
      loading: {
        ...state.loading,
        [key]: true,
      },
      errors: {
        ...state.errors,
        [key]: null,
      },
    }));

    try {
      if (isGuestUser(useAuthStore.getState().user)) {
        set(state => ({
          entries: {
            ...state.entries,
            [key]: [],
          },
          ranks: {
            ...state.ranks,
            [key]: null,
          },
        }));
        return;
      }

      const response = await LeaderboardService.getLeaderboard(
        scope,
        period,
        limit,
      );

      set(state => ({
        entries: {
          ...state.entries,
          [key]: response.data || [],
        },
        ranks: {
          ...state.ranks,
          [key]: response.yourRank ?? null,
        },
      }));
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Unable to load leaderboard right now.';

      set(state => ({
        entries: {
          ...state.entries,
          [key]: [],
        },
        ranks: {
          ...state.ranks,
          [key]: null,
        },
        errors: {
          ...state.errors,
          [key]: message,
        },
      }));
    } finally {
      set(state => ({
        loading: {
          ...state.loading,
          [key]: false,
        },
      }));
    }
  },
  getEntries: (scope, period) => get().entries[getKey(scope, period)] || [],
  getRank: (scope, period) => get().ranks[getKey(scope, period)] ?? null,
  reset: () =>
    set({
      entries: {},
      ranks: {},
      loading: {},
      errors: {},
    }),
}));
