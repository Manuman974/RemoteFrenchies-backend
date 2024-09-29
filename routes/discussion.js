const express = require('express');
const router = express.Router();
const User = require('../models/users'); // Import Users model
const Discussion = require('../models/discussion'); // Import Discussion model or Message model
const mongoose = require('mongoose');
const Pusher = require('pusher');

const pusher = new Pusher({
    appId: process.env.APP_ID,
    key: process.env.KEY,
    secret: process.env.SECRET,
    cluster: process.env.CLUSTER,
    useTLS: true,
});

// Route pour vérifier ou créer une discussion entre deux utilisateurs
router.post('/discussions/message', (req, res) => {
    const { token, userId, text } = req.body;

    if (!text || !token || !userId) {
        return res.status(400).json({ result: false, error: 'Missing text, token, or userId' });
    }

    User.findOne({ token })
        .then(user => {
            if (!user) {
                return res.status(404).json({ result: false, error: 'User not found' });
            }

            const newMessage = {
                message: text,
                author: user._id,
                date: new Date()
            };

            return Discussion.findOneAndUpdate(
                {
                    $or: [
                        { user_1: user._id, user_2: userId },
                        { user_1: userId, user_2: user._id }
                    ]
                },
                { $push: { message: newMessage } }, // Ajoute le message à la discussion
                { new: true, upsert: true } // Crée une nouvelle discussion si elle n'existe pas
            ).then(savedDiscussion => {
                // Émettre un événement Pusher après avoir sauvegardé le message
                pusher.trigger(`discussion-${savedDiscussion._id}`, 'new-message', {
                    message: newMessage,
                    userId: user._id,
                });
                res.json({ result: true, discussion: savedDiscussion });
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ result: false, error: 'Internal server error' });
        });
});

router.get('/discussions/messages/:token/:otherUserId', (req, res) => {
    const { token } = req.params;
    console.log("Token reçu:", token);

    User.findOne({ token })
        .then(user => {
            if (!user) {
                console.log("Utilisateur non trouvé pour le token:", token);
                return res.status(404).json({ result: false, error: 'User not found' });
            }
            console.log("Utilisateur trouvé:", user);
            // Récupérer toutes les discussions de l'utilisateur, excluant celles avec lui-même
            return Discussion.find({
                $or: [{ user_1: user._id }, { user_2: user._id }],
                // user_1: { $ne: user._id }, // Exclure les discussions où l'utilisateur est les deux parties
                // user_2: { $ne: user._id }
            }).populate('user_1 user_2 message.author')
              .then(discussions => {
                console.log("Discussions trouvées:", discussions);
                  if (!discussions || discussions.length === 0) {
                      return res.json({ result: false, message: 'No discussions found' });
                  }
                  res.json({ result: true, discussions });
              });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ result: false, error: 'Internal server error' });
        });
});

// Route pour récupérer les messages d'une discussion entre deux utilisateurs
// router.get('/messages/:token/:userId', (req, res) => {
//     const { token, userId } = req.params;

//     if (!token || !userId) {
//         return res.status(400).json({ error: 'Missing token or userId' });
//     }

//     if (!mongoose.isValidObjectId(userId)) {
//         return res.status(400).json({ result: false, error: 'Invalid user ID' });
//     }

//     User.findOne({ token })
//         .then(user => {
//             if (!user) {
//                 return res.status(404).json({ result: false, error: 'User not found' });
//             }

//             return Discussion.findOne({
//                 $or: [
//                     { user_1: user._id, user_2: userId },
//                     { user_1: userId, user_2: user._id }
//                 ]
//             }).populate('message.author');
//         })
//         .then(discussion => {
//             if (!discussion) {
//                 return res.status(404).json({ result: false, error: 'Discussion not found' });
//             }
//             res.json({ result: true, discussion });
//         })
//         .catch(err => {
//             console.error(err);
//             res.status(500).json({ result: false, error: 'Internal server error' });
//         });
// });

// POST - Envoyer un nouveau message dans une discussion
router.post('/discussions/messages', (req, res) => {
    const { text, token, userId } = req.body;

    User.findOne({ token })
        .then(user => {
            if (!user) {
                return res.status(404).json({ result: false, error: 'User not found' });
            }

            const newMessage = {
                message: text,
                author: user._id,
                date: new Date()
            };

            return Discussion.findOne({
                $or: [
                    { user_1: user._id, user_2: userId },
                    { user_1: userId, user_2: user._id }
                ]
            }).then(existingDiscussion => {
                if (existingDiscussion) {
                    existingDiscussion.message.push(newMessage);
                    return existingDiscussion.save().then(savedDiscussion => {
                        // Émettre un événement Pusher après avoir sauvegardé le message
                        pusher.trigger(`discussion-${savedDiscussion._id}`, 'new-message', {
                            message: newMessage,
                            userId: user._id,
                        });
                        res.json({ result: true, discussion: savedDiscussion });
                    });
                } else {
                    const newDiscussion = new Discussion({
                        user_1: user._id,
                        user_2: userId,
                        message: [newMessage]
                    });

                    return newDiscussion.save().then(savedDiscussion => {
                        // Émettre un événement Pusher après avoir créé la nouvelle discussion
                        pusher.trigger(`discussion-${savedDiscussion._id}`, 'new-message', {
                            message: newMessage,
                            userId: user._id,
                        });
                        res.json({ result: true, discussion: savedDiscussion });
                    });
                }
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ result: false, error: 'Internal server error' });
        });
});

module.exports = router;
