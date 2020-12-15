const express =require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT 

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

// create application/x-www-form-urlencoded parser
app.listen(port , ()=>{
    console.log('App is up at port' + port);
    
})
