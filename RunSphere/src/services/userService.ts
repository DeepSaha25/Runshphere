import ApiClient from './apiClient';

const UserService = {
  async getProfile() {
    return ApiClient.get('/user/profile');
  },

  async updateLocation(latitude: number, longitude: number) {
    return ApiClient.put('/user/location', { latitude, longitude });
  },

  async getStats() {
    return ApiClient.get('/user/stats');
  },
};

export default UserService;
