var express = require('express');
var router = express.Router();
const User = require('../models/users');

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