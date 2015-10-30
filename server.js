var express = require('express')

var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var session = require('express-session');
var flash = require('connect-flash');

// importált modulok
var Waterline = require('waterline');
var waterlineConfig = require('./config/waterline');

var indexController = require('./controllers/index');
var receptController = require('./controllers/recept');
var loginController = require('./controllers/login');


//-------------------------------------------

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// Local Strategy for sign-up
passport.use('local-signup', new LocalStrategy({
        usernameField: 'felhnev',
        passwordField: 'password',
        passReqToCallback: true,
    },   
    function(req, felhnev, password, done) {
        req.app.models.user.findOne({ felhnev: felhnev }, function(err, user) {
            if (err) { return done(err); }
            if (user) {
                return done(null, false, { message: 'Létező felhasználónév.' });
            }
            req.app.models.user.create(req.body)
            .then(function (user) {
                return done(null, user);
            })
            .catch(function (err) {
                return done(null, false, { message: err.details });
            })
        });
    }
));

// Stratégia
passport.use('local', new LocalStrategy({
        usernameField: 'felhnev',
        passwordField: 'password',
        passReqToCallback: true,
    },
    function(req, felhnev, password, done) {
        req.app.models.user.findOne({ felhnev: felhnev }, function(err, user) {
            if (err) { return done(err); }
            if (!user || !user.validPassword(password)) {
                return done(null, false, { message: 'Helytelen adatok.' });
            }
            return done(null, user);
        });
    }
));

// Middleware segédfüggvény
function setLocalsForLayout() {
    return function (req, res, next) {
        res.locals.loggedIn = req.isAuthenticated();
        res.locals.user = req.user;
        next();
    }
}
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login');
}
function andRestrictTo(role) {
    return function(req, res, next) {
        if (req.user.role == role) {
            next();
        } else {
            next(new Error('Unauthorized'));
        }
    }
}

//-------------------------------------------
//  express app
var app = express();

//config
app.set('views', './views');
app.set('view engine', 'hbs');

//Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(session({
    cookie: { maxAge: 600000 },
    secret: 'titkos szoveg',
    resave: false,
    saveUninitialized: false,
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(setLocalsForLayout());


//endpoints
app.use('/', indexController);
//app.use('/receptek', receptController);
app.use('/receptek', ensureAuthenticated, receptController);
app.use('/login', loginController);

app.get('/operator', ensureAuthenticated, andRestrictTo('operator'), function(req, res) {
    res.end('operator');
});
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

// ORM példány
var orm = new Waterline();
orm.loadCollection(Waterline.Collection.extend(require('./models/recept')));
orm.loadCollection(Waterline.Collection.extend(require('./models/user')));

// ORM indítása
orm.initialize(waterlineConfig, function(err, models) {
    if(err) throw err;
    
    app.models = models.collections;
    app.connections = models.connections;
    
    // Start Server
    //var port = process.env.PORT || 3000;
    //app.listen(port, function () {
    //    console.log('Server is started.');
    //});
    var port = process.env.PORT;
    var host = process.env.IP;
    var server = app.listen(port, host, function(){console.log('Server is started.');});
    
    console.log("ORM is started.");
});