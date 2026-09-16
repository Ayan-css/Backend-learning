const mongoose = require("mongoose")

async function connectDB() {
    await mongoose.connect("mongodb+srv://yt:Ve9CnpskL8YQgfdhsfdggfdfaKsQ@backeneaswefd-database.yu7aqeb.mongodb.net/halley")

    console.log("Connected to DB");
    
}

module.exports = connectDB
