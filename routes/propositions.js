var express = require('express');
var router = express.Router();

const User = require('../models/users');
const Proposition = require('../models/proposition');

router.post('/proposition', (req, res) => {
    // Destructuration du code
    const {
        main_address,
        welcome_day,
        reception_hours,
        fiber_connection,
        coffee_tea,
        dedicated_office,
        other,
        description,
        userId
    } = req.body;

    
    // Vérifier si une proposition avec les mêmes détails existe déjà pour l'utilisateur
    Proposition.findOne({
        main_address: { street: req.body.main_address},
        welcome_day,
        reception_hours,
        fiber_connection,
        coffee_tea,
        dedicated_office,
        other,
        description,
        user: userId
    })
    .then(existingProposition => {
        console.log(req.body)
        if (existingProposition) {
            // erreur si proposition existante
            res.json({ result: false, error: 'Proposition already exists' });
        } else {
            // Creation nouvelle proposition
            const newProposition = new Proposition({
                user: userId,
                main_address: { street: main_address },
                welcome_day,
                reception_hours,
                fiber_connection,
                coffee_tea,
                dedicated_office,
                other,
                description
            });

            // Save nouvelle proposition
            newProposition.save()
                .then(savedProposition => {
                    // Mettre à jour le champ de proposition de l'utilisateur avec l'ID de la nouvelle proposition
                    User.findByIdAndUpdate(userId, { $push: { propositions: savedProposition._id } })
                        .then(() => {
                            // nouvelle proposition saved
                            res.json({ result: true, proposition: savedProposition });
                        })
                        
                })
                
        }
    })
    
});

module.exports = router;


        
                
                    
                    
                
                