var express = require('express');
var router = express.Router();
const User = require('../models/users');



router.put('/', (req, res) => {

// Utilisation de la destructuration (ex: remote: req.body.checkboxes.remote)
    const {
        remote,
        hybrid,
        interested_in_teleworking,
        encounter,
        share_skills,
        share_hobbies,
        welcome_remoters,
        go_to_remoters,
        both,
    } = req.body.checkboxes;

    // 2 critères à renseigner (le critère de recherche et l'élément à mettre à jour)
    User.updateOne({ token: req.body.token }, { on_boarding: { remote, hybrid, interested_in_teleworking, encounter, share_skills, share_hobbies, welcome_remoters, go_to_remoters, both, } })
        .then(result => {
            console.log(req.body)
            console.log( 'object consologué: ', remote)
            console.log(result)
            if (result.modifiedCount > 0) {
                
                res.json({ result: true, message: 'Mise à jour réussie' });
                
               
            } else {
                res.json({ result: false, error: 'Préférences déjà existentes' });
            }
            
        });
});

router.get('/on_boarding/:userId', (req, res) => {
    const userId = req.params.userId;

    User.findById(userId)
        .then(user => {
            if (!user) {
                return res.json({ result: false, error: 'User not found' });
            } else {
                res.json({ result: true, preferences: user.on_boarding });
            }
        });

});

module.exports = router;