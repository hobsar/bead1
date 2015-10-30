var express = require('express');
var passport = require('passport');

var router = express.Router();

router.get('/', function (req, res) {
    res.render('login/index', {
        receptMessages: req.flash('recept')
    });
})

router.post('/', passport.authenticate('local', {
    successRedirect: '/receptek/list',
    failureRedirect: '/login',
    failureFlash: true,
    badRequestMessage: 'Hiányzó adatok'
}));

router.get('/signup', function (req, res) {
    res.render('login/signup', {
        receptMessages: req.flash('recept')
    });
});

router.post('/signup', passport.authenticate('local-signup', {
    successRedirect:    '/login',
    failureRedirect:    '/login/signup',
    failureFlash:       true,
    badRequestMessage:  'Hiányzó adatok'
}));

module.exports = router;