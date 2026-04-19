import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';
import { protect } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/role.middleware.js';

const router = express.Router();

// Optional authentication middleware - checks for token but doesn't fail if missing
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.status === 'active') {
        req.user = user;
      }
    } catch (error) {
      // Token is invalid or expired, continue without user
      console.log('Invalid token in contact form:', error.message);
    }
  }
  next();
};

// Send a message (anyone can send, but captures user ID if logged in)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    const newMessage = await Message.create({
      name,
      email,
      message,
      sender: req.user?._id || null, // Captures user ID if logged in
    });

    res.status(201).json({ 
      message: 'Message sent successfully!', 
      data: newMessage 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get all messages (must be before GET /:id to avoid route conflicts)
router.get('/admin/all-messages', protect, adminOnly, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Send reply to message
router.post('/admin/:id/reply', protect, adminOnly, async (req, res) => {
  try {
    const { replyMessage } = req.body;
    if (!replyMessage) return res.status(400).json({ message: 'Reply message is required' });

    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    msg.replies.push({
      message: replyMessage,
      sentBy: 'admin',
    });
    msg.isRead = true;

    await msg.save();
    res.json({ message: 'Reply sent successfully', data: msg });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Close message
router.patch('/admin/:id/close', protect, adminOnly, async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      { status: 'closed' },
      { new: true }
    );
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    res.json({ message: 'Message closed', data: msg });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get my messages (only for logged-in users) - matches by sender ID or email
router.get('/my-messages', protect, async (req, res) => {
  try {
    // Find messages where user is the sender OR where email matches (for messages sent before login)
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { email: req.user.email }
      ]
    }).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get message details (only for sender or admin)
router.get('/:id', protect, async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    // Only allow sender or admin to view
    // Message belongs to user if they are the sender OR if the message email matches their email
    const isSender = msg.sender?.toString() === req.user._id.toString() || msg.email === req.user.email;
    const isAdmin = req.user.role === 'admin';
    
    if (!isSender && !isAdmin) {
      return res.status(403).json({ message: 'Not allowed to view this message' });
    }

    res.json(msg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add reply to message (logged-in users can reply to their own, admin can reply to any)
router.post('/:id/reply', protect, async (req, res) => {
  try {
    const { replyMessage } = req.body;
    if (!replyMessage) return res.status(400).json({ message: 'Reply message is required' });

    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    // Only allow sender (user) or admin (staff) to reply
    // User can reply if they are the sender OR if the message email matches their email
    const isOwner = msg.sender?.toString() === req.user._id.toString() || msg.email === req.user.email;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not allowed to reply to this message' });
    }

    // Add reply
    msg.replies.push({
      message: replyMessage,
      sentBy: req.user.role === 'admin' ? 'admin' : 'user',
    });

    // If admin replies, mark as read
    if (isAdmin) {
      msg.isRead = true;
    }

    await msg.save();
    res.json({ message: 'Reply added successfully', data: msg });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
