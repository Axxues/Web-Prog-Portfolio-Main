import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  message: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null for non-logged-in users
  isRead: { type: Boolean, default: false },
  replies: [{
    message: { type: String, required: true },
    sentBy: { type: String, enum: ['user', 'admin'], required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
export default Message;
