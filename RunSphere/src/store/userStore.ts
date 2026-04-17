import {create} from 'zustand';
import {devtools} from 'zustand/middleware';
import RunService from '../services/runService';
import UserService from '../services/userService';
import {useAuthStore} from './authStore';

interface UserState {
  profile: any | null;
  stats: any;
  dailyStats: any;
  weeklyStats: any;
  recentRuns: any[];
  isLoading: boolean;
  refreshDashboard: (historyLimit?: number) => Promise<void>;
  updateBackendLocation: (latitude: number, longitude: number) => Promise<any>;
}

const emptyStats = {
  totalDistance: 0,
  totalDuration: 0,
  totalRuns: 0,
  avgSpeed: 0,
  averagePace: 0,
  caloriesBurned: 0,
  elevationGain: 0,
};

const emptyPeriodStats = {
  totalDistance: 0,
  totalRuns: 0,
  avgSpeed: 0,
  averagePace: 0,
};

export const useUserStore = create<UserState>()(
  devtools(
    (set, get) => ({
      profile: null,
      stats: emptyStats,
      dailyStats: emptyPeriodStats,
      weeklyStats: emptyPeriodStats,
      recentRuns: [],
      isLoading: false,
      refreshDashboard: async (historyLimit = 10) => {
        set({isLoading: true});

        try {
          const [profileRes, statsRes, dailyRes, weeklyRes, historyRes] =
            await Promise.allSettled([
              UserService.getProfile(),
              RunService.getStats(),
              RunService.getDailyStats(),
              RunService.getWeeklyStats(),
              RunService.getHistory(historyLimit),
            ]);

          const nextProfile =
            profileRes.status === 'fulfilled' ? profileRes.value.data : get().profile;

          if (nextProfile) {
            await useAuthStore.getState().setUser(nextProfile);
          }

          set({
            profile: nextProfile,
            stats: statsRes.status === 'fulfilled' ? statsRes.value.data : get().stats,
            dailyStats:
              dailyRes.status === 'fulfilled'
                ? dailyRes.value.data
                : get().dailyStats,
            weeklyStats:
              weeklyRes.status === 'fulfilled'
                ? weeklyRes.value.data
                : get().weeklyStats,
            recentRuns:
              historyRes.status === 'fulfilled'
                ? historyRes.value.data || []
                : get().recentRuns,
          });
        } finally {
          set({isLoading: false});
        }
      },
      updateBackendLocation: async (latitude, longitude) => {
        const response = await UserService.updateLocation(latitude, longitude);
        set({profile: response.data});
        await useAuthStore.getState().setUser(response.data);
        return response.data;
      },
    }),
    {name: 'runsphere-user-store'},
  ),
);
