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

      const newUser = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        job: req.body.job,
        business: req.body.business,
        main_address: { city: req.body.main_address },
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

router.post('/on_boarding', (req, res) => {
  const {
    remote,
    hybride,
    interested_in_teleworking,
    encounter,
    share_skills,
    share_hobbies,
    welcome_remoters,
    go_to_remoters,
    both
  } = req.body;
  
  User.findOne({ remote, hybride, interested_in_teleworking, encounter, share_skills, share_hobbies, welcome_remoters, go_to_remoters, both }).then(data => { console.log(data)
    if (data === null) {

      const newUser = new User({
        
        on_boarding: {
          remote,
          hybride,
          interested_in_teleworking,
          encounter,
          share_skills,
          share_hobbies,
          welcome_remoters,
          go_to_remoters,
          both
        }
      });
      newUser.save().then(() => {
        res.json({ result: true, user: newUser });
        console.log(data)
      });

    } else {
      res.json({ result: false, error: 'Preference already exists' });
    }
  });
});

module.exports = router;
      
      

    



