var express = require("express");
var router = express.Router();

const os = require('os'); // Import os for tmp directory
const cloudinary = require("cloudinary").v2;
const uniqid = require("uniqid");
const fs = require("fs");
const User = require("../models/users");

// Mise à jour du profil de l'utilisateur
router.put("/profile", async (req, res) => {
  console.log("Requête reçue:", req.body);

  // Chemin temporaire dynamique
  const tmpDir = os.tmpdir(); // Récupère le répertoire temporaire du système
  const photoPath = `${tmpDir}/${uniqid()}.jpg`;

    // Vérifie que req.files contient bien les fichiers attendus
    if (!req.files || !req.files.photoFromFront) {
      return res.status(400).json({ result: false, error: "Aucun fichier reçu" });
    }

    const resultMove = await req.files.photoFromFront.mv(photoPath);
    if (!resultMove) {
      try {
        const resultCloudinary = await cloudinary.uploader.upload(photoPath);
        const token = req.body.Token;
  
        User.findOne({ token }).then((userDoc) => {
          if (userDoc) {
            userDoc.profile_picture = resultCloudinary.secure_url;
            userDoc.save();
            res.json({ result: true, url: resultCloudinary.secure_url });
          } else {
            res.json({ result: false, error: "Le document n'a pas pu être modifié" });
          }
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ result: false, error: "Erreur lors du téléchargement Cloudinary" });
      } finally {
        fs.unlinkSync(photoPath); // Supprime le fichier temporaire après l'envoi
      }
    } else {
      res.json({ result: false, error: resultMove });
    }
  });

module.exports = router;
