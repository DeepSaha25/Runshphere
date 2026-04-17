import ApiClient from './apiClient';

export interface RunPayload {
  distance: number;
  duration: number;
  coordinates: Array<{ latitude: number; longitude: number; timestamp?: string }>;
  date?: string;
  elevationGain?: number;
  caloriesBurned?: number;
}

const RunService = {
  async submitRun(payload: RunPayload) {
    return ApiClient.post('/run/add', payload);
  },

  async getHistory(limit = 50, startDate?: string, endDate?: string) {
    let endpoint = `/run/history?limit=${limit}`;
    if (startDate) endpoint += `&startDate=${startDate}`;
    if (endDate) endpoint += `&endDate=${endDate}`;
    return ApiClient.get(endpoint);
  },

  async getStats() {
    return ApiClient.get('/run/stats');
  },

  async getWeeklyStats() {
    return ApiClient.get('/run/weekly-stats');
  },

  async getDailyStats(date?: string) {
    let endpoint = '/run/daily-stats';
    if (date) endpoint += `?date=${date}`;
    return ApiClient.get(endpoint);
  },
};

export default RunService;
