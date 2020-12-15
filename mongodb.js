//crud

const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const ObjectID = mongodb.ObjectID

const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'

MongoClient.connect(connectionURL, {useNewUrlParser : true}, (error, client) => {
    if(error){
        return console.log("Unable to connect to db")
    }
    const db = client.db(databaseName)

//     db.collection('users').insertOne({
//         name:"Bhavit",
//         age:21
//     })
// })
// MongoClient.connect(connectionURL, {useNewUrlParser : true} , (error ,client ) =>{
//     if(error){
//         return console.log('Unable to connect');
//     }
//     const db = client.db(databaseName)

//     db.collection('tasks').insertMany([{
//         description:'Buy bread',
//         completed : true
//     },{
//         description:'Vist school',
//         completed : true
//     },{
//         description:'Buy clock',
//         completed : false
//     }] , (error,result)=>{
//         if(error){
//             return console.log('Unable to insert');    
//         }

//         console.log(result.ops)
//     }) 
        db.collection('tasks').deleteOne({
            _id : ObjectID("5fbf7f7217348a2c80c31275")
        }).then((result)=>{
            console.log(result);
        }).catch((err)=>{
            console.log(err);
        })
})