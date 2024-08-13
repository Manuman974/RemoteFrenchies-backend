const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },  // Référence à l'utilisateur
  message: String,
  date: { type: Date, default: Date.now },
});

const discussionSchema = mongoose.Schema({
  user_1: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  user_2: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  message: [messageSchema],  // Tableau de messages
});

const Discussion = mongoose.model('Discussion', discussionSchema);

module.exports = Discussion;