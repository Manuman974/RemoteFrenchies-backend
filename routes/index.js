var express = require('express');
var router = express.Router();
const User = require('../models/users');

// Récupérer les discussions d'un utilisateur.
router.get('/messages/:token', (req, res) => {
    const token = req.params.token;
    User.findOne({ token: token })
        .populate('discussion').then((data) => {
            res.json({ result: true, data })
        })
});

module.exports = router;