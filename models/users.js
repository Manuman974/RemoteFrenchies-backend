const mongoose = require("mongoose");

const addressSchema = mongoose.Schema({
  street: String,
  city: String,
  longitude: Number,
  latitude: Number,
});

const on_boardingSchema = mongoose.Schema({
  remote: {
    type: Boolean,

    default: false,
  },

  hybrid: {
    type: Boolean,
    default: false
  },

  interested_in_teleworking: {
    type: Boolean,
    default: false
  },

  encounter: {
    type: Boolean,
    default: false
  },

  share_skills: {
    type: Boolean,
    default: false
  },
  
  share_hobbies: {
    type: Boolean,
    default: false
  },

  welcome_remoters: {
    type: Boolean,
    default: false
  },

  go_to_remoters: {
    type: Boolean,
    default: false
  },

  both: {
    type: Boolean,
    default: false,

  },
  
});

const userSchema = mongoose.Schema({
  firstname: String,
  lastname: String,
  job: String,
  business: String,
  phone_number: String,
  e_mail: String,
  profile_picture: String,
  password: String,
  token: String,
  main_address: addressSchema,
  on_boarding: on_boardingSchema,
  proposition: { type: mongoose.Schema.Types.ObjectId, ref: "propositions" },
  discussion: [{ type: mongoose.Schema.Types.ObjectId, ref: "Discussion" }],
  blog: { type: mongoose.Schema.Types.ObjectId, ref: "blogs" },
});

const User = mongoose.model("users", userSchema);

module.exports = User;
