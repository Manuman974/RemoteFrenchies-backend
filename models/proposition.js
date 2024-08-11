const mongoose = require("mongoose");

const propositionSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  main_address: {
    street: String,
    city: String, // MODIF 1
  },
  welcome_day: String,
  reception_hours: String,
  fiber_connection: {
    type: Boolean,
    default: false,
  },
  coffee_tea: {
    type: Boolean,
    default: false,
  },
  dedicated_office: {
    type: Boolean,
    default: false,
  },
  other: String,
  home_photo: String,
  description: String,
});

const Proposition = mongoose.model("propositions", propositionSchema);

module.exports = Proposition;
