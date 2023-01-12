const bCrypt = require('bcrypt');

const createHash = (password) => {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null)
}

const passwordValidation = (enteredPassword, hash) => {
    return bCrypt.compareSync(enteredPassword, hash)
}

module.exports = { createHash, passwordValidation }