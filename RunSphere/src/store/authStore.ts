import {create} from 'zustand';
import {createJSONStorage, devtools, persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiClient from '../services/apiClient';
import AuthService, {
  LoginPayload,
  SignupPayload,
  AuthResponse,
} from '../services/authService';

type AuthUser = Record<string, any> | null;

interface AuthState {
  token: string | null;
  user: AuthUser;
  hydrated: boolean;
  bootstrap: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  loginAsGuest: () => Promise<AuthResponse>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    devtools(
      (set, get) => ({
        token: null,
        user: null,
        hydrated: false,
        bootstrap: async () => {
          await ApiClient.init();
          const user = await ApiClient.getStoredUser();

          set({
            token: ApiClient.token,
            user,
            hydrated: true,
          });
        },
        login: async payload => {
          const response = await AuthService.login(payload);
          set({
            token: response.token,
            user: response.user,
            hydrated: true,
          });
          return response;
        },
        loginAsGuest: async () => {
          const response = await AuthService.loginAsGuest();
          set({
            token: response.token,
            user: response.user,
            hydrated: true,
          });
          return response;
        },
        signup: async payload => {
          await AuthService.signup(payload);
        },
        logout: async () => {
          await AuthService.logout();
          set({
            token: null,
            user: null,
            hydrated: true,
          });
        },
        setUser: async user => {
          const token = get().token;
          if (token && user) {
            await ApiClient.setAuth(token, user);
          }
          set({user});
        },
      }),
      {name: 'runsphere-auth-store'},
    ),
    {
      name: 'runsphere-auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        token: state.token,
        user: state.user,
      }),
    },
  ),
);
