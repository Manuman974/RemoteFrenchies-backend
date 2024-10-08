var express = require("express");
var router = express.Router();

const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

// Créer un nouvel utilisateur par la page Signup
router.post("/signup", (req, res) => {
  if (
    !checkBody(req.body, [
      "firstname",
      "lastname",
      "job",
      "business",
      "main_address",
      "e_mail",
      "password",
    ])
  ) {
    console.log("REQ", req.body, [
      "firstname",
      "lastname",
      "job",
      "business",
      "main_address",
      "e_mail",
      "password",
    ]);

    res.json({ result: false, error: "Missing or empty fields" });

    return;
  }

  // Ajout nouvel utilisateur page signup
  User.findOne({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    job: req.body.job,
    business: req.body.business,
    main_address: { city: req.body.main_address },
    e_mail: req.body.e_mail,
  }).then((data) => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      // creer les valeurs par default du sous document on_boarding
      const preferences = {
        remote: false,
        hybrid: false,
        interested_in_teleworking: false,
        encounter: false,
        share_skills: false,
        share_hobbies: false,
        welcome_remoters: false,
        go_to_remoters: false,
        both: false,
      };

      //Fetch pour récupérer les coordonnées d'une ville
      fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${req.body.main_address}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.features.length === 0) {
            return; // Aucune action n'est réalisée si aucune ville trouvée par l'API
          }
          const latitudetest = data.features[0].geometry.coordinates[1];
          const longitudetest = data.features[0].geometry.coordinates[0];

          const newUser = new User({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            job: req.body.job,
            business: req.body.business,
            main_address: {
              city: req.body.main_address,
              latitude: latitudetest,
              longitude: longitudetest,
            },
            profile_picture:"https://asset.cloudinary.com/dk074zmxu/fe9d8bc236d3c7164e01502a277a65a3",
            on_boarding: { preferences },
            e_mail: req.body.e_mail,
            password: hash,
            token: uid2(32),
          });

  newUser.save().then((newDoc) => {
    res.json({ result: true, token: newDoc.token });
  });
});
} else {
  res.json({ result: false, error: "User already exists" });
}
  });
});

// Connexion d'un utilisateur
router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["e_mail", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  User.findOne({ e_mail: req.body.e_mail }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      console.log("Profile picture URL:", data.profile_picture);
      res.json({
        result: true,
        userId: data._id,
        firstname: data.firstname,
        lastname: data.lastname,
        job: data.job,
        business: data.business,
        main_adress: data.main_adress,
        token: data.token,
        profile_picture: data.profile_picture,
        photos: data.photos || [],
      });
    } else {
      res.json({ result: false, error: "User not found or wrong password" });
    }
  });
});

// Récupération des messages
router.get("/messages/:token", async (req, res) => {
  const user = await User.findOne({ token: req.params.token }).populate("discussion");
  if (!user) {
    return res.json({ result: false, error: "User not found" });
  }
  
  res.json({ result: true, messages: user.discussion 

  });
});

// Route pour modifier les informations de l'utilisateur
router.put("/update/:userId", (req, res) => {
  const userId = req.params.userId;
  const updateData = req.body; // Les nouvelles informations à mettre à jour

  User.findByIdAndUpdate(userId, updateData, { new: true })
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.json({ result: false, error: "User not found" });
      }
      res.json({ result: true, user: updatedUser });
    })
    .catch((error) => res.json({ result: false, error: error.message }));
});

// Vérifie si un utilisateur existe dans la base de données
router.get('/:userId', (req, res) => {

  const userId = req.params.userId;

  User.findById(userId)

    .then(user => {
      console.log(userId)
      if (!user) {

        return res.json({ result: false, error: 'User not found' });
      } else {
        res.json({ result: true, message: 'User exist' });
      }
    });

});

module.exports = router;
