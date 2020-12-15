const mongoose = require('mongoose')
const validator =  require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

userSchema = new mongoose.Schema( {
    name : {
        type : String,
        required : true,
        trim : true
    },
    email : {
        type:String,
        unique : true,
        required : true,        
        trim : true,
        lowercase : true,
        validate(value){
            if(!validator.isEmail(value))
            {
                throw new Error('Email not valid')
            }
        }
    },
    age : {
        type:Number,
        default : 0
    },
    password : {
        required:true,
        type:String,
        trim : true,
        minLength : 7,
        validate(value){
            if(value.toLowerCase()==='password'){
                throw new Error('Password cannot be password')
            }
        }
    },
    tokens : [{
        token:{
            type:String,
            required:true
        }
    }],
    avatar : {
        type:Buffer
    }
},{
    timestamps:true
})

userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({_id : user._id.toString()} ,process.env.jwtSeceret )
    user.tokens = user.tokens.concat({token})
    await user.save()

    return token
}

userSchema.virtual('tasks' , {
    ref : 'Task',
    localField : '_id',
    foreignField : 'owner'
})

userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.statics.findByCredentials = async (email,password)=>{
    const user = await User.findOne({email})    

    if(!user){
        throw new Error('Unable to login');   
    }
    const isMatch = await bcrypt.compare(password,user.password)
    
    if(!isMatch){
        throw new Error('Unable to login');   
    }   

    return user
}

// hash password before saving
userSchema.pre('save' , async function(next){
    const user = this   
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.pre('remove' , async function(next){
    const user = this   
    await Task.deleteMany({owner:user._id })
    next()
})

const User = mongoose.model('User' , userSchema)

module.exports = User