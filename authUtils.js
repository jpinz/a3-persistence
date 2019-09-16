const bcrypt = require('bcrypt');
module.exports = {
    hashPassword: function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(3));
    },
    comparePassword: function(plaintext, hashPassword) {
        return bcrypt.compareSync(plaintext, hashPassword);
    }
}