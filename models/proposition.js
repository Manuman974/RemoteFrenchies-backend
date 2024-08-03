const mongoose = require('mongoose');

const propositionSchema = mongoose.Schema({
  fiber_connection: Boolean,
  coffee_tea: Boolean,
  dedicated_office: Boolean,
  other: String,
  home_photo: String,
  description: String,
  reception_hours: String,
  welcome_day: Date,
  
});

const Proposition = mongoose.model('propositions', propositionSchema);

module.exports = Proposition;