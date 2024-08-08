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
<<<<<<< HEAD

    default: false,
=======
    default: false 
>>>>>>> cb32cb4b62f990d3586cc47b8206a0dc742b6de1
  },

  hybrid: {
    type: Boolean,
<<<<<<< HEAD

    default: false,
=======
    default: false
>>>>>>> cb32cb4b62f990d3586cc47b8206a0dc742b6de1
  },

  interested_in_teleworking: {
    type: Boolean,
<<<<<<< HEAD

    default: false,
=======
    default: false
>>>>>>> cb32cb4b62f990d3586cc47b8206a0dc742b6de1
  },

  encounter: {
    type: Boolean,
<<<<<<< HEAD

    default: false,
=======
    default: false
>>>>>>> cb32cb4b62f990d3586cc47b8206a0dc742b6de1
  },

  share_skills: {
    type: Boolean,
<<<<<<< HEAD

    default: false,
=======
    default: false
>>>>>>> cb32cb4b62f990d3586cc47b8206a0dc742b6de1
  },
  
  share_hobbies: {
    type: Boolean,
<<<<<<< HEAD

    default: false,
=======
    default: false
>>>>>>> cb32cb4b62f990d3586cc47b8206a0dc742b6de1
  },

  welcome_remoters: {
    type: Boolean,
<<<<<<< HEAD

    default: false,
=======
    default: false
>>>>>>> cb32cb4b62f990d3586cc47b8206a0dc742b6de1
  },

  go_to_remoters: {
    type: Boolean,
<<<<<<< HEAD

    default: false,
=======
    default: false
>>>>>>> cb32cb4b62f990d3586cc47b8206a0dc742b6de1
  },

  both: {
    type: Boolean,
<<<<<<< HEAD

    default: false,
=======
    default: false
>>>>>>> cb32cb4b62f990d3586cc47b8206a0dc742b6de1
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
  discussion: { type: mongoose.Schema.Types.ObjectId, ref: "discussions" },
  blog: { type: mongoose.Schema.Types.ObjectId, ref: "blogs" },
});

const User = mongoose.model("users", userSchema);

module.exports = User;
