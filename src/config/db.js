const mongoose = require('mongoose');

// connect to mongodb

const database = mongoose.connect(process.env.DB_CONNECTION_STRING,{

})
.then(()=>{
    console.log('Database is Connected Sucessfully')
})
.catch((err)=>{
    console.log('MongoDb Connection Error',err)
});


module.exports = database