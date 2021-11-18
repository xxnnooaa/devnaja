const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try{
        const token = req.headers.authorization.split('Bearer ')[1];
        const decode = jwt.verify(token, process.env.JWT_KEY);
        req.auth = decode
        return next();
    }catch(err){
        return res.status(401).json({
            msg: 'Auth Fail'
        })
    }
}
