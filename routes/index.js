/**
 * Created by championswimmer on 15/06/17.
 */
const route = require('express').Router();
const User = require('../db/models').User;
const passport = require('../auth/passport');
const eli = require('../auth/utils').eli;
const AuthToken = require('../db/models').AuthToken;
const uid2 = require('uid2');
const encrypt = require('../auth/utils').encrypt;

route.post('/signup', (req, res) => {
    User.create({
        username: req.body.username,
        email: req.body.email,
        //NEVER EVER DO THIS IS PRODUCTION
        //PASSWORDS SHOULD BE HASHED
        password: encrypt(req.body.password)
    }).then((user) => {
        res.redirect('/login.html')
    })
});

route.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login.html'
}));

route.get('/logout', (req, res) => {
    req.user = null;
    req.logout();
    req.session.destroy(function () {
        res.redirect('/login.html')
    })
});

route.get('/profile', eli('/login.html'), (req, res) => {
    res.send(req.user);
});

route.post('/token', passport.authenticate('local'), (req, res) => {

    AuthToken.create({
        token: uid2(20),
        userId: req.user.id
    }).then((authToken) => {
        return res.send({
            token: authToken.token
        })
    })

});

// Implement this if possible (To rsvp users)
route.get('/rsvp/:token', (req, res) => {
    EventInvitee.update( {
        rsvp: req.query.rsvp
    }, {
        where: {
            token: req.params.token
        }
    })
});

'http://localhost:3456/rsvp/kahsfiasy?rsvp=true'
'http://localhost:3456/rsvp/kahsfiasy?rsvp=false'

module.exports = route;
