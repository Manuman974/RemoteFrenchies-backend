var express = require('express');
var router = express.Router();


const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');


router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['firstname', 'lastname', 'job', 'business','city', 'e_mail', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // route ajout nouvel utilisateur page signup
  User.findOne({ firstname: req.body.firstname, lastname: req.body.lastname, job: req.body.job, business: req.body.business, city: req.body.city, e_mail: req.body.e_mail }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        job: req.body.job,
        business: req.body.business,
        city: req.body.city,
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

module.exports = router;
