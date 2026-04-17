import ApiClient from './apiClient';

const CommunityService = {
  async getFeed(page = 1, limit = 20) {
    return ApiClient.get(`/community/feed?page=${page}&limit=${limit}`);
  },

  async createPost(text: string, runId?: string) {
    return ApiClient.post('/community/post', { text, runId });
  },

  async toggleLike(postId: string) {
    return ApiClient.post(`/community/post/${postId}/like`);
  },

  async addComment(postId: string, text: string) {
    return ApiClient.post(`/community/post/${postId}/comment`, { text });
  },
};

export default CommunityService;
