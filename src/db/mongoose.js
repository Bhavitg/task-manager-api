const mongoose = require('mongoose')

mongoose.connect(process.env.Mongodb,
{
    useNewUrlParser:true,
    useCreateIndex:true 
})

