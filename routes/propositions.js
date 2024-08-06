var express = require('express');
var router = express.Router();

const User = require('../models/users');
const Proposition = require('../models/proposition');

router.post('/proposition', (req, res) => {
    // Destructure the body for easier access
    const {
        main_address,
        welcome_day,
        reception_hours,
        fiber_connection,
        coffee_tea,
        dedicated_office,
        other,
        description
    } = req.body;
    const userId = req.body.userId;
   
    // Check if a proposition already exists
    Proposition.findOne({
        'main_address.street': main_address.street, // Accès à un sous-champ
        'proposition.welcome_day': welcome_day,
        'proposition.reception_hours': reception_hours,
        'proposition.fiber_connection': fiber_connection,
        'proposition.coffee_tea': coffee_tea,
        'proposition.dedicated_office': dedicated_office,
        'proposition.other': other,
        'proposition.description': description,
        user: req.body.userId // Inclure l'utilisateur dans la vérification
    
        
    }).then(data => { 
        console.log(req.body)
        if (data === null) {
            // Create a new proposition if none exists
            const newProposition = new Proposition({
                main_address: main_address,
                proposition: {
                    welcome_day: welcome_day,
                    reception_hours: reception_hours,
                    fiber_connection: fiber_connection,
                    coffee_tea: coffee_tea,
                    dedicated_office: dedicated_office,
                    other: other,
                    description: description
                },
                user: userId // Associer la proposition à l'utilisateur
                
            });
            newProposition.save()
                .then(() => {
                    
                    res.json({ result: true, user: newProposition });
                })
                
        } else {
            
            res.json({ result: false, error: 'Proposition already exists' });
        }
    })
        
});

        
        
        module.exports = router;

        