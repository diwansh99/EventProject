/**
 * Created by championswimmer on 15/06/17.
 */
const route = require('express').Router();
const passport = require('../../auth/passport');

route.use(passport.authenticate('bearer'));

route.use('/events', require('./events'));
route.use('/users', require('./users'));

module.exports = route;