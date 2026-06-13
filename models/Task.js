const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  status:      { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  priority:    { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);