const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async(req, res, next) => {
    try {

        // read in bearer auth code and remove the string 'Bearer'
        const token = req.header('Authorization').replace('Bearer ', '')

        // verify token from req with secret 
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // since id is encoded in authToken, lookup user by decoded id
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!user) {
            throw new Error()
        }

        req.token = token
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = auth