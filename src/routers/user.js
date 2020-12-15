const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const bodyParser = require('body-parser')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')


const urlencodedParser = bodyParser.urlencoded({ extended: false })

router.post('/users' , urlencodedParser, async (req,res) =>{
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user , token })
    }catch(e){ 
        res.status(400)
        res.send(e)
    }
})

router.post('/users/login' , async(req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email , req.body.password)
        const token = await user.generateAuthToken()
        res.send({user , token })
    }catch(e){
        res.status(400).send()
    }
})

router.post('/users/logout' , auth , async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

router.post('/users/logoutAll' , auth , async(req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.status(200).send()
    }catch(e){
        res.status(500).send()
    }
})

router.get('/users/me' ,auth, async (req,res) => {
    if(req.user){
    return res.send(req.user)
    }
    res.send('Please Authenticate')
})

router.patch('/users/me' ,urlencodedParser , auth ,  async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','email','password','age']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update) )

    if(!isValidOperation){
        return res.status(400).send({error:'invalid updates'})
    }

    try{        
        updates.forEach((update) => req.user[update] = req.body[update] )
        await req.user.save()
        res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})



const upload = multer({
    limit : {
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(png|jpg|jpeg)$/)){
            return cb(new Error('Please Upload Image file'))
        } 
        cb(undefined,true)
    }
})

router.post('/users/me/avatar' , auth , upload.single('avatar')  , async (req,res)=>{
    req.user.avatar = await sharp(req.file.buffer).resize({height:250 , width:250}).png().toBuffer()
    await req.user.save()
    res.send()
}, (error , req ,res,next )=>{  
    res.status(400).send({error:error.message})
} )

router.get('/users/:id/avatar' , async(req,res)=>{
    try{
        const user = await User.findById(req.params.id)        
        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type' , 'image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(400).send()
    }
})

router.delete('/users/me/avatar' , auth , async (req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
}, (error , req ,res,next )=>{  
    res.status(400).send({error:error.message})
} )

router.delete('/users/me' ,auth, async(req,res)=>{
    try{
        await req.user.remove()
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    } 

})

module.exports = router