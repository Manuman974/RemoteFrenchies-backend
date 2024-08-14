var express = require("express");
var router = express.Router();

const User = require("../models/users");
const Proposition = require("../models/proposition");
const uniqid = require("uniqid");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

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
  } = req.body;
  //user.find req.body.token
  const main_address = { street: req.body.street, city: req.body.city }; //MODIF 3(ajout)

  User.findOne({ token }).then((user) => {
    console.log("DATA USER : ", user);
    if (!user) {
      console.log(req.body);
      return res.json({ result: false, error: "User not found" });
    } else {
      console.log("REQ:", req.body);
      // Vérifier si une proposition avec les mêmes détails existe déjà pour l'utilisateur
      Proposition.findOne({
        // main_address: { street: req.body.main_address }, A supprimer si la team valide les modifs // MODIF 4(suppression)
        main_address, //Modif 5 (ajout)
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
          //MOFIF INTRODUCTION DE MON FETCH POUR RECUPERER TOUTES LES PROPOSITIONS D'UNE VILLE
          //encodeURI permet d'ajouter des caractères spéciaux à une chaîne de caractères pour que les paramètres puissent être lus par l'API quand elle attend des caractères spéciaux entre mot par exemple
          fetch(
            `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
              req.body.street
            )}`
          )
            .then((response) => response.json())
            .then((data) => {
              if (data.features.length === 0) {
                return; // Aucune action n'est réalisée si aucune ville trouvée par l'API
              }
              console.log(encodeURIComponent(req.body.street));
              console.log("ADRESS DATA:", data.features);

              //DECLARATION D'UNE VARIABLE POUR FILTRER & RECUPERER ADRESSE PROPOSITION
              const dataCollect = data.features
                .filter((address) => address.properties.city == req.body.city) // Filtrer les données qui correspondent à la ville
                .map((filteredAddress) => {
                  return {
                    fullAddress: filteredAddress.properties.label,
                    coordinates: filteredAddress.geometry.coordinates,
                    city: filteredAddress.properties.city,
                  };
                });

              console.log("FILTERED ADDRESS:", dataCollect);

              // Creation nouvelle proposition
              const newProposition = new Proposition({
                user: user._id,
                // main_address: { street: main_address }, // MODIF 6(suppression)

                main_address: {
                  street: req.body.street,
                  city: req.body.city,
                  adressLongitude: dataCollect[0].coordinates[0],
                  addressLatitude: dataCollect[0].coordinates[1],
                },
                //MODIF 7 (ajout) -> Du coup en frontend faudra ajouter un input Ville. Pour récupérer cette donnée en backend et l'utiliser en frontend.
                welcome_day,
                reception_hours,
                fiber_connection,
                coffee_tea,
                dedicated_office,
                other,
                description,
              });
              // Save nouvelle proposition
              newProposition.save().then((savedProposition) => {
                console.log("SAVEDPROPOSITION :", savedProposition);
                // Mettre à jour le champ de proposition de l'utilisateur avec l'ID de la nouvelle proposition

                User.findByIdAndUpdate(
                  user._id, // MODIF 8 (remplacé User._id par user._id)
                  { proposition: savedProposition._id }, //Permet de modifier le document user en ajoutant un champs et une valeur

                  { new: true } //MODIF 9(ajout) Permet de mettre à jour le document user
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
  console.log("infos:", req.files.photoFromFront);
  const photoPath = `./tmp/${uniqid()}.jpg`;
  const resultMove = await req.files.photoFromFront.mv(photoPath);

  if (!resultMove) {
    const resultCloudinary = await cloudinary.uploader.upload(photoPath);
    res.json({ result: true, url: resultCloudinary.secure_url });
  } else {
    res.json({ result: false, error: resultMove });
  }
  fs.unlinkSync(photoPath);
});

//MODIF
//Route GET pour rechercher les Remoters d'une ville

router.get("/search/:city", (req, res) => {
  Proposition.find({
    "main_address.city": { $regex: new RegExp(req.params.city, "i") },
  }) // Utilisation de la notation pointée pour le champ imbriqué + populate pour récupérer les infos de l'utilisateur
  .populate('user')
    .then((data) => {
      console.log(data);
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
