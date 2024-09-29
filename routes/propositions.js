var express = require("express");
var router = express.Router();

const User = require("../models/users");
const Proposition = require("../models/proposition");
const uniqid = require("uniqid");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const os = require('os'); // Import os for tmp directory

router.post("/proposition", (req, res) => {
  // Destructuration du code
  const {
    // main_address, //MODIF 2(suppression)
    welcome_day,
    reception_hours,
    fiber_connection,
    coffee_tea,
    dedicated_office,
    other,
    description,
    token,
    home_photo, //MODIF URL
  } = req.body;
  //user.find req.body.token
  const main_address = { street: req.body.street, city: req.body.city }; //MODIF 3(ajout)

  User.findOne({ token }).then((user) => {
    if (!user) {
      return res.json({ result: false, error: "User not found" });
    } else {

      // Vérifier si une proposition avec les mêmes détails existe déjà pour l'utilisateur
      Proposition.findOne({
        main_address,
        welcome_day,
        reception_hours,
        fiber_connection,
        coffee_tea,
        dedicated_office,
        other,
        description,
      }).then((existingProposition) => {
        if (existingProposition) {
          // erreur si proposition existante
          res.json({ result: false, error: "Proposition already exists" });
        } else {
          //FETCH POUR RECUPERER LES COORDONNEES ADRESSES
          //encodeURI permet d'ajouter des caractères spéciaux à une chaîne de caractères pour que les paramètres puissent être lus par l'API quand elle attend des caractères spéciaux entre mot par exemple
          fetch(
            `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
              `${req.body.street} ${req.body.city}`
            )}`
          )
            .then((response) => response.json())
            .then((data) => {

              const latitude = data.features[0].geometry.coordinates[1];

              const longitude = data.features[0].geometry.coordinates[0];

              if (data.length === 0) {
                return res.json({
                  result: false,
                  error: "No address found matching the city",
                });
              }

              // Creation nouvelle proposition
              const newProposition = new Proposition({
                user: user._id,
                main_address: {
                  street: req.body.street,
                  city: req.body.city,
                  addressLongitude: longitude,
                  addressLatitude: latitude,
                },
                //MODIF 7 (ajout) -> Du coup en frontend faudra ajouter un input Ville. Pour récupérer cette donnée en backend et l'utiliser en frontend.
                welcome_day,
                reception_hours,
                fiber_connection,
                coffee_tea,
                dedicated_office,
                other,
                description,
                home_photo, //MODIF URL
              });
              // Save nouvelle proposition
              newProposition.save().then((savedProposition) => {
  
                // Mettre à jour le champ de proposition de l'utilisateur avec l'ID de la nouvelle proposition

                User.findByIdAndUpdate(
                  user._id,
                  { proposition: savedProposition._id } //Permet de modifier le document user en ajoutant un champs et une valeur

                  // { new: true } //MODIF 9(ajout) Permet de mettre à jour le document user
                ).then(() => {
                  // nouvelle proposition saved
                  res.json({
                    result: true,
                    proposition: savedProposition,
                  });
                });
              });
            });
        }
      });
    }
  });
});

router.post("/upload", async (req, res) => {
  // Vérifie que req.files contient bien les fichiers attendus
  if (!req.files || !req.files.photoFromFront) {
    return res.status(400).json({ result: false, error: "Aucun fichier reçu" });
  }

  // Chemin temporaire dynamique pour Windows
  const tmpDir = os.tmpdir();
  const photoPath = `${tmpDir}/${uniqid()}.jpg`;

  try {
    // Déplace l'image temporaire
    await req.files.photoFromFront.mv(photoPath);

    // Télécharge l'image sur Cloudinary
    const resultCloudinary = await cloudinary.uploader.upload(photoPath);
    
    // Envoie l'URL Cloudinary en réponse
    res.json({ result: true, url: resultCloudinary.secure_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: "Erreur lors du téléchargement Cloudinary" });
  } finally {
    // Supprime le fichier temporaire après utilisation
    fs.unlinkSync(photoPath);
  }
});


//Route GET pour rechercher les Remoters d'une ville

router.get("/search/:city", (req, res) => {
  Proposition.find({
    "main_address.city": { $regex: new RegExp(req.params.city, "i") },
  }) // Utilisation de la notation pointée pour le champ imbriqué
    .populate("user")
    .then((data) => {
      if (data.length > 0) {
        // Pour vérifier si des données ont été trouvées
        res.json({
          result: true,
          propositionData: data,
          message: "Remoters found from this city",
        });
      } else {
        res.json({ result: false, error: "City not found" });
      }
    });
});

module.exports = router;
