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
        proposition:null,
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
      res.json({ result: true, token: data.token });
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  });
});


module.exports = router;
      
      

    



