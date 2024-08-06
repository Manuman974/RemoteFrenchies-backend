var express = require('express');
var router = express.Router();
const User = require('../models/users');

router.get('/preferences/:userId', (req, res) => {
    const userId = req.params.userId;

    User.findById(userId)
        .then(user => {
            if (!user) {
                return res.status(404).json({ result: false, error: 'User not found' });
            }

            res.json({ result: true, preferences: user.on_boarding });
        })
        .catch(err => {
            console.error('Error finding user:', err);
            res.status(500).json({ result: false, error: 'Error finding user' });
        });
});

module.exports = router;