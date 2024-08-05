const mongoose = require('mongoose');

const addressSchema = mongoose.Schema({
  street: String,
  city: String,
 });

 const on_boardingSchema = mongoose.Schema({
  remote: Boolean,
  hybride: Boolean,
  interested_in_teleworking: Boolean,
  encounter: Boolean,
  share_skills: Boolean,
  welcome_remoters: Boolean,
  go_to_remoters: Boolean,
  both: Boolean,
});

const userSchema = mongoose.Schema({
  firstname: String,
  lastname: String,
  job: String,
  business: String,
  // phone_number: String,
  e_mail: String,
  // profile_picture: String,
  password: String,
  token: String,
  main_address: addressSchema,
  // on_boarding: on_boardingSchema,
  // proposition : { type: mongoose.Schema.Types.ObjectId, ref: 'propositions' },
  // discussion: { type: mongoose.Schema.Types.ObjectId, ref: 'discussions' },
  // blog: { type: mongoose.Schema.Types.ObjectId, ref: 'blogs' },
  
});







const User = mongoose.model('users', userSchema);

module.exports = User;