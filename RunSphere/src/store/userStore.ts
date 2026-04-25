import {create} from 'zustand';
import {devtools} from 'zustand/middleware';
import RunService from '../services/runService';
import UserService from '../services/userService';
import {guestUser, isGuestUser} from '../services/guestSession';
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

const guestProfile = {
  ...guestUser,
  totalDistance: 12.4,
  totalRuns: 4,
  streak: 2,
};

const guestStats = {
  totalDistance: 12.4,
  totalDuration: 4380,
  totalRuns: 4,
  avgSpeed: 10.2,
  averagePace: 5.9,
  caloriesBurned: 868,
  elevationGain: 74,
};

const guestRecentRuns = [
  {
    _id: 'guest-run-1',
    distance: 4.2,
    duration: 1480,
    avgSpeed: 10.2,
    caloriesBurned: 294,
    elevationGain: 18,
    date: new Date().toISOString(),
  },
  {
    _id: 'guest-run-2',
    distance: 3.1,
    duration: 1120,
    avgSpeed: 10,
    caloriesBurned: 217,
    elevationGain: 12,
    date: new Date(Date.now() - 86400000).toISOString(),
  },
];

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
          if (isGuestUser(useAuthStore.getState().user)) {
            set({
              profile: guestProfile,
              stats: guestStats,
              dailyStats: {
                totalDistance: 4.2,
                totalRuns: 1,
                avgSpeed: 10.2,
                averagePace: 5.9,
              },
              weeklyStats: {
                totalDistance: 12.4,
                totalRuns: 4,
                avgSpeed: 10.2,
                averagePace: 5.9,
              },
              recentRuns: guestRecentRuns.slice(0, historyLimit),
            });
            return;
          }

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
        if (isGuestUser(useAuthStore.getState().user)) {
          const profile = {
            ...guestProfile,
            location: {latitude, longitude},
          };

          set({profile});
          await useAuthStore.getState().setUser(profile);
          return profile;
        }

        const response = await UserService.updateLocation(latitude, longitude);
        set({profile: response.data});
        await useAuthStore.getState().setUser(response.data);
        return response.data;
      },
    }),
    {name: 'runsphere-user-store'},
  ),
);
