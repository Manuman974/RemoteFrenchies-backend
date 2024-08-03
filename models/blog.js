const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
  articles: articleSchema 
  
});

const articleSchema = mongoose.Schema({
    title: String,
    image: String,
    text: String,
    date: Date,
    
    
    
  });

const Blog = mongoose.model('', blogSchema);

module.exports = Blog;