const router = require('./users.router.js');
const {getUserByUsername, comparePasswords} = require('./user.controller.js');

function baseAuthentication() {
    return [async (req, res, next) => {
        if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
            return res.status(401).json({
                message: 'Missing Authorization Header !!!'
            });
        }

        const base64Credentials = req.headers.authorization.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');
        var isValid;
        await getUserByUsername(username, password).then(async (result) => {
            if (!result) {
                logger.error("Invalid credentials");
                return res.status(401).json({
                    message: 'Invalid Authentication Credentials !!!'
                });
            } else {
                isValid = await comparePasswords(password, result.dataValues.password);
                if (!isValid) {
                    logger.error("Invalid credentials");
                    return res.status(401).json({
                        message: 'Invalid Authentication Credentials !!!'
                    });
                } else {
                    if (!result.dataValues.isVerified) {
                        return res.status(401).json({
                            message: 'User Email not Verified !!! '
                        });
                    } else {
                        req.user = {
                            username: username,
                            password: password
                        };
                        next();
                    }

                }
            }
        });
    }];
}

module.exports = baseAuthentication;