const express = require('express');
const router = express.Router();
const User = require('../models/users'); // Import Users model
const Discussion = require('../models/discussion'); // Import Discussion model or Message model

// POST - Envoyer un nouveau message
router.post('/messages', (req, res) => {
    const { text, token } = req.body;

    // Rechercher l'utilisateur à partir du token
    User.findOne({ token })
        .then(user => {
            if (!user) {
                return res.json({ result: false, error: 'User not found' });
            }
            console.log(text)
            // Création du nouveau message
            const newMessage = {
                message: text,
                author: user._id,
                date: new Date()
            };

            // Rechercher une discussion existante entre user_1 et user_2
            return Discussion.findOne({
                $or: [
                    { user_1: user._id },
                    { user_2: user._id }
                ]
            }).then(existingDiscussion => {
                if (existingDiscussion) {
                    // Si une discussion existe déjà, ajouter le message à cette discussion
                    existingDiscussion.message.push(newMessage);
                    return existingDiscussion.save().then(savedDiscussion => {
                        res.json({ result: true, discussion: savedDiscussion });
                    });
                } else {
                    // Si la discussion n'existe pas, créer une nouvelle discussion
                    const newDiscussion = new Discussion({
                        user_1: user._id,
                        user_2: user._id, // à déterminer plus tard
                        message: [newMessage]
                    });

                    // Sauvegarder la nouvelle discussion
                    return newDiscussion.save().then(savedDiscussion => {
                        //Ajouter la discussion à l'utilisateur
                        return User.findByIdAndUpdate(
                            user._id,
                            { $push: { discussion: savedDiscussion._id } },
                            { new: true }
                            ).then((data) => {
                            console.log('updated user', data, savedDiscussion._id)
                            res.json({ result: true, discussion: savedDiscussion });
                        });
                    });
                }
            });
        })
});

router.get('/messages/:token', (req, res) => {
    // Récupérer l'ID de la discussion depuis les paramètres de la requête
    const token = req.params.token;
    User.findOne({ token: token })
        .populate('discussion').then((data) => {
            res.json({ result: true, data })
        })
});

module.exports = router;
