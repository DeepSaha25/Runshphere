const Post = require('../models/Post');
const Run = require('../models/Run');
const ApiError = require('../utils/ApiError');

class CommunityService {
  /**
   * Create a new community post
   */
  static async createPost(userId, { text, runId }) {
    if (runId) {
      const run = await Run.findOne({ _id: runId, userId });
      if (!run) {
        throw ApiError.forbidden('You can only attach your own runs to a post');
      }
    }

    const post = new Post({
      userId,
      text,
      runId: runId || null
    });
    await post.save();
    return post.populate([
      { path: 'userId', select: 'name email location' },
      { path: 'runId', select: 'distance duration avgSpeed date' }
    ]);
  }

  /**
   * Get community feed (paginated)
   */
  static async getFeed(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email location streak')
      .populate('runId', 'distance duration avgSpeed caloriesBurned date');

    const total = await Post.countDocuments();

    return {
      posts: posts.map(p => {
        const post = p.toObject();
        return {
          ...post,
          likesCount: post.likes ? post.likes.length : 0,
          commentsCount: post.comments ? post.comments.length : 0
        };
      }),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Like / unlike a post
   */
  static async toggleLike(postId, userId) {
    const post = await Post.findById(postId);
    if (!post) throw ApiError.notFound('Post not found');

    const likeIndex = post.likes.findIndex((likeUserId) => likeUserId.toString() === userId.toString());
    if (likeIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    return { liked: likeIndex === -1, likesCount: post.likes.length };
  }

  /**
   * Add comment to a post
   */
  static async addComment(postId, userId, text) {
    const post = await Post.findById(postId);
    if (!post) throw ApiError.notFound('Post not found');

    post.comments.push({ userId, text });
    await post.save();
    return post;
  }
}

module.exports = CommunityService;
