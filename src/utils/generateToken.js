const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id },          // ✔ correct user ID
        process.env.SECRET_KEY,    // ✔ secret key
              { expiresIn: '7d' }      // ✔ token expiry
    );
};

module.exports = generateToken;
