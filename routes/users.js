var express = require('express');
var router = express.Router();


const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');


router.post('/signup', (req, res) => {

  if (!checkBody(req.body, ['firstname', 'lastname', 'job', 'business', 'main_address', 'e_mail', 'password'])) {
    console.log(req.body, ['firstname', 'lastname', 'job', 'business', 'main_address', 'e_mail', 'password'])
    res.json({ result: false, error: 'Missing or empty fields' });

    return
  }

  // route ajout nouvel utilisateur page signup
  User.findOne({ firstname: req.body.firstname, lastname: req.body.lastname, job: req.body.job, business: req.body.business, main_address: { city: req.body.main_address }, e_mail: req.body.e_mail }).then(data => {
    if (data === null) {
      console.log(data);
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



      const newUser = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        job: req.body.job,
        business: req.body.business,
        main_address: { city: req.body.main_address },
        on_boarding: {preferences},
        e_mail: req.body.e_mail,
        password: hash,
        token: uid2(32),

      });

      newUser.save().then(newDoc => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: 'User already exists' });
    }
  });
});

router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['e_mail', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ e_mail: req.body.e_mail }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, firstname:data.firstname, lastname:data.lastname, job:data.job, business:data.business, main_adress:data.main_adress, token: data.token });
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  });
});




// Route GET
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

//Route GET pour trouver un utilisateur pour Mon profil
// router.get("/users/:userId", (req,res) => {
//   console.log("Requete",req.params.userId )
//   const userId = req.params.userId;
//   User.findById(userId)
//   .then(user => {
//       if (!user) {
//           return res.json({ result: false, error: 'User not found' });
//       } else {
//           res.json({ result: true });
//       }
//   });

module.exports = router;
      
      

    



