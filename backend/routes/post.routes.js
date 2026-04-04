import express from 'express';
import Post from '../models/Post.js';
import { protect } from '../middleware/auth.middleware.js';
import { memberOrAdmin as memberOrAdminRole } from '../middleware/role.middleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/', protect, memberOrAdminRole, upload.single('image'), async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) return res.status(400).json({ message: 'Title and body are required' });
    const image = req.file ? `/uploads/${req.file.filename}` : '';
    const post = await Post.create({ title, body, image, author: req.user._id });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' }).populate('author', 'name email profilePic').sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name email');
    if (!post || post.status === 'removed') return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, memberOrAdminRole, upload.single('image'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed to edit this post' });
    }
    post.title = req.body.title || post.title;
    post.body = req.body.body || post.body;
    if (req.file) post.image = `/uploads/${req.file.filename}`;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, memberOrAdminRole, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed to delete this post' });
    }
    await post.remove();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
