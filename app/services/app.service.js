const db = require("../models");
const bcrypt = require('bcrypt');
const User = db.users;

module.exports = {
    authenticate
};

async function authenticate({ username, password }) {
    const user = User.findAll({
        where: { username: username }
    }).then(user => {
        var result = bcrypt.compareSync(password, user[0].dataValues.password);
        if (result) {
            console.log("Password Verified !!!");
            return result;
        } else {
            console.log("Password Incorrect !!!");
        }
    }).catch(err => console.log('error: ' + err));;
    return user;
}
