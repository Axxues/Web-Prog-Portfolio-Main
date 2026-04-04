import express from 'express';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { protect } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/role.middleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/users/:id/status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'admin') return res.status(404).json({ message: 'User not found' });
    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();
    res.json({ message: `User is now ${user.status}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'name email').sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/posts/:id/remove', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.status = 'removed';
    await post.save();
    res.json({ message: 'Post removed', post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin can update their own profile
router.put('/profile', upload.single('profilePic'), async (req, res) => {
  try {
    const admin = await User.findById(req.user._id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    admin.name = req.body.name || admin.name;
    admin.bio = req.body.bio || admin.bio;
    if (req.file) admin.profilePic = `/uploads/${req.file.filename}`;
    await admin.save();
    res.json({ message: 'Admin profile updated', admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
