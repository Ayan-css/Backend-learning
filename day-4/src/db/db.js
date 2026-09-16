const mongoose = require("mongoose");

async function connectDB(){
    await mongoose.connect("mongodb+srv://yt:Ve9CnpskL8YQgKsQ@backend-database.yu7aqeb.mongodb.net/project-1")
    console.log("Connected To mongoDB")
}



module.exports = connectDB;