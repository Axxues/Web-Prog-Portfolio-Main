import express from 'express';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Message from '../models/Message.js';
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

// Admin statistics endpoint
router.get('/stats', async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await User.countDocuments({ role: 'member' });
    const activeUsers = await User.countDocuments({ role: 'member', status: 'active' });
    const inactiveUsers = totalUsers - activeUsers;

    // Get post statistics
    const totalPosts = await Post.countDocuments();
    const publishedPosts = await Post.countDocuments({ status: 'published' });
    const removedPosts = await Post.countDocuments({ status: 'removed' });

    // Get message statistics
    const totalMessages = await Message.countDocuments();
    const openMessages = await Message.countDocuments({ status: 'open' });
    const closedMessages = await Message.countDocuments({ status: 'closed' });

    // Get users joined per day (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const usersTrend = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          role: 'member'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get posts created per day (last 30 days)
    const postsTrend = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get recent activity (last 10 items across users/posts)
    const recentUsers = await User.find({ role: 'member' }).select('name email createdAt').sort({ createdAt: -1 }).limit(10);
    const recentPosts = await Post.find().select('title author createdAt').sort({ createdAt: -1 }).limit(10);

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers
      },
      posts: {
        total: totalPosts,
        published: publishedPosts,
        removed: removedPosts
      },
      messages: {
        total: totalMessages,
        open: openMessages,
        closed: closedMessages
      },
      trends: {
        usersTrend,
        postsTrend
      },
      recent: {
        users: recentUsers,
        posts: recentPosts
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
