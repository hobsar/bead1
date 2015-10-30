// controllers/recept.js
var express = require('express');
var router = express.Router();

var decorateReceptek = require('../viewmodels/recept');

// Receptlista oldal
router.get('/list', function (req, res) {
    req.app.models.recept.find().then(function (receptek) {
        res.render('receptek/list', {
            receptek: decorateReceptek(res.locals.user.id,receptek),
            messages: req.flash('info')
        });
    });
});

// Receptszerkesztő oldal
router.get('/szerkeszt/:id', function (req, res) {
    var validationErrors = (req.flash('validationErrors') || [{}]).pop();
    var data = (req.flash('data') || [{}]).pop();
    
    var receptid = req.params.id;
    req.app.models.recept.findOne({ id: receptid }).then(function (recept) {
        if(res.locals.user.id == recept.feltolto) {
            res.render('receptek/szerkeszt', {
                validationErrors: validationErrors,
                data: recept,
            });
        } else {
            req.flash('info', 'Nem szerkesztheted');
            res.redirect('/receptek/list');
        }
    });
});


// Recept felvitele
router.get('/new', function(req, res) {
    var validationErrors = (req.flash('validationErrors') || [{}]).pop();
    var data = (req.flash('data') || [{}]).pop();
    
    res.render('receptek/new', {
        validationErrors: validationErrors,
        data: data,
    });
})

// Recept felvitele POST
router.post('/new', function(req, res) {
   // adatok ellenőrzése
    req.checkBody('knev', 'Hibás ételnév').notEmpty().withMessage('Kötelező megadni!');
    req.checkBody('katkat', 'Hibás kategória').notEmpty().withMessage('Kötelező megadni!');
    req.sanitizeBody('leiras').escape();
    req.checkBody('leiras', 'Hibás leírás').notEmpty().withMessage('Kötelező megadni!');
    
    var validationErrors = req.validationErrors(true);
    console.log(validationErrors);
    
    if (validationErrors) {
        // űrlap megjelenítése a receptekkel és a felküldött adatokkal
        req.flash('validationErrors', validationErrors);
        req.flash('data', req.body);
        res.redirect('/receptek/new');
    }
    else {
        req.app.models.recept.create({
            feltolto: res.locals.user.id,
            knev: req.body.knev,
            status: 'new',
            kategoria: req.body.katkat,
            description: req.body.leiras
        })
        .then(function (recept) {
            //siker
            req.flash('info', 'Recept sikeresen felvéve!');
            res.redirect('/receptek/list');
        })
        .catch(function (err) {
            //hiba
            console.log(err)
        });
    }
})

//recept szerkesztése
router.post('/szerkeszt/:id', function(req, res) {
    req.checkBody('knev', 'Hibás ételnév').notEmpty().withMessage('Kötelező megadni!');
    req.checkBody('katkat', 'Hibás kategória').notEmpty().withMessage('Kötelező megadni!');
    req.sanitizeBody('leiras').escape();
    req.checkBody('leiras', 'Hibás leírás').notEmpty().withMessage('Kötelező megadni!');
    
    var validationErrors = req.validationErrors(true);
    console.log(validationErrors);
    
    if (validationErrors) {
        // űrlap megjelenítése a receptekkel és a felküldött adatokkal
        req.flash('validationErrors', validationErrors);
        req.flash('data', req.body);
        res.redirect('/receptek/szerkeszt');
    } else {
        req.app.models.recept
        .update(
            {
                id: req.params.id,
                feltolto: res.locals.user.id
            },
            {
                knev: req.body.knev,
                status:'assigned',
                kategoria: req.body.katkat,
                description: req.body.leiras
            })
        .exec(function afterwards(err, recept){

            if (err) {
             // handle error here- e.g. `res.serverError(err);`
            return;
            }
            req.flash('info', 'Recept sikeresen módosítva!');
            res.redirect('/receptek/list');
        });
    }
});

//recept törlése
router.get('/delete/:id', function(req, res) {
   
        req.app.models.recept
        .destroy(
            {
                id: req.params.id,
                feltolto: res.locals.user.id
            })
        .exec(function afterwards(err, recept){

            if (err) {
             // handle error here- e.g. `res.serverError(err);`
            return;
            }
            req.flash('info', 'Recept sikeresen törölve!');
            res.redirect('/receptek/list');
        });
});


module.exports = router;