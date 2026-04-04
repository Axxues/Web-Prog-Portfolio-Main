import express from 'express';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { postId, body } = req.body;
    if (!postId || !body) return res.status(400).json({ message: 'postId and body are required' });
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const comment = await Comment.create({ post: postId, author: req.user._id, body });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId }).populate('author', 'name');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
