const mongoose = require('mongoose');

const discussionSchema = mongoose.Schema({
  user_1: id,
  user_2: id,
  message: messageSchema,
  
});

const messageSchema = mongoose.Schema({
    author: String,
    message: String,
    date: date,
   });

const Discussion = mongoose.model('Discussions', discussionSchema);

module.exports = Discussion;