/**
 * Created by championswimmer on 15/06/17.
 */
const bcrypt = require('bcrypt');

function encrypt(password) {
    "use strict";
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

function decrypt(password, local_password) {
    "use strict";
    return bcrypt.compareSync(password, local_password);
}

function ensureLoggedIn(redirPath) {

    return function (req, res, next) {

        if (!req.user) {
            res.redirect(redirPath)
        } else {
            next();
        }

    }
}

function ensureAdmin() {
    return function (req, res, next) {
        req.userIsAdmin = !req.user.roleId != 4;
        next();

    }
}

module.exports = {
    eli: ensureLoggedIn,
    eia: ensureAdmin,
    encrypt,
    decrypt
};