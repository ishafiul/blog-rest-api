const jwt  = require('jsonwebtoken');
module.exports = class Authmiddle{
    token(req, res, next) {
        const authHeader = req.headers['autorization']
        const token = authHeader.split(' ')[1]

        if(token){
            jwt.verify(token, process.env.TOKEN_SECRET,(err,info)=>{
                if (err) {
                    return res.sendStatus(403)
                }
                else{
                    req.user = info
                }
            })
        }
        else{
            return res.sendStatus(401)
        }
        console.log('middleware ok')
        next()
    }
}
