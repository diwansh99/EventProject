/**
 * Created by championswimmer on 15/06/17.
 */
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const User = require('../db/models').User;
const AuthToken = require('../db/models').AuthToken;
const decrypt = require('../auth/utils').decrypt;

passport.serializeUser(function (user, done) {
    console.log('serializing user :' + user.id);
    done(null, user.id)
});

passport.deserializeUser(function (userKey, done) {
    console.log('Deserializing user :' + userKey);
    User.findByPrimary(userKey).then((user) => {
        done(null, user)
    }).catch((err) => {
        done(err)
    })
});


passport.use(new LocalStrategy(
    function (username, password, done) {

        User.findOne({
            where: {
                username: username,
            }
        }).then((user) => {

            if(!user) {
                return done(null, false, {message: 'Username or password was wrong'});
            }
            else if(decrypt(password, user.password)) {
                return done(null, user);
            }
            else
                return done(null, false, {message: 'Username or password was wrong'});

        }).catch((err) =>{
            done(err);
        })
    })
);

passport.use(new BearerStrategy(function (token, done) {
    AuthToken.findOne({
        where: {
            token: token
        },
        include: [User]
    }).then((token) => {

        if(!token) {
            return done(null, false, {message: 'No such token found'})
        }
        done(null, token.user)

    }).catch((err) => {

        return done(err)
    })
}));




module.exports = passport;