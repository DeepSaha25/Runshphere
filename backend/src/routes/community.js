const express = require('express');
const authenticate = require('../middlewares/auth');
const {
  createPost,
  getFeed,
  toggleLike,
  addComment
} = require('../controllers/communityController');

const router = express.Router();

// All routes require auth
router.use(authenticate);

/**
 * GET /api/community/feed
 * Get paginated community feed
 */
router.get('/feed', getFeed);

/**
 * POST /api/community/post
 * Create a new community post
 */
router.post('/post', createPost);

/**
 * POST /api/community/post/:postId/like
 * Toggle like on a post
 */
router.post('/post/:postId/like', toggleLike);

/**
 * POST /api/community/post/:postId/comment
 * Add comment to a post
 */
router.post('/post/:postId/comment', addComment);

module.exports = router;
