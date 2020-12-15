const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req,res,next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token,process.env.jwtSeceret)
        const user = User.findOne({_id: decoded._id, 'tokens.token':token})

        if(!user){
            throw new Error()
        }

        user.then((use)=>{
            req.user = use
            req.token = token
            next()            
        });
    }catch(e){
        res.send({ error : 'Please Authenticate'})
    }
}

module.exports = auth