var express = require('express');
var router = express.Router();
const User = require('../models/users');

router.post('/on_boarding', (req, res) => {
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
    } = req.body;

    User.findOne({ token: req.body.token }).then(user => {
        console.log(req.body)
        if (user !== null) {

            user.on_boarding = (
                {
                    remote,
                    hybrid,
                    interested_in_teleworking,
                    encounter,
                    share_skills,
                    share_hobbies,
                    welcome_remoters,
                    go_to_remoters,
                    both,
                }
            )
            user.save().then((data)=>{res.json({ user:data })})
            
        } else {
            res.json({ result: false, error: 'Preference already exists' });
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