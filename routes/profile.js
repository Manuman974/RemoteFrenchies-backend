var express = require("express");
var router = express.Router();

const cloudinary = require("cloudinary").v2;
const uniqid = require("uniqid");
const fs = require("fs");

const User = require("../models/users");

router.put("/profile", async (req, res) => {
  const photoPath = `./tmp/${uniqid()}.jpg`;
  const resultMove = await req.files.photoFromFront.mv(photoPath);
  if (!resultMove) {
    const resultCloudinary = await cloudinary.uploader.upload(photoPath);
    const token = req.body.Token;
    User.findOne(
      { token }
      // { profile_picture: resultCloudinary.secure_url }
    ).then((userDoc) => {
      if (userDoc) {
        userDoc.profile_picture = resultCloudinary.secure_url;
        userDoc.save();
        res.json({ result: true, url: resultCloudinary.secure_url });
      } else {
        res.json({
          result: false,
          error: "Le document n'a pas pu être modifié",
        });
      }
    });
  } else {
    res.json({ result: false, error: resultMove });
  }

  fs.unlinkSync(photoPath);
});

module.exports = router;
