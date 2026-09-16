const mongoose = require("mongoose");


const noteSchema = new mongoose.Schema({ /*this is used to tell which type of data we will be storing*/
    title:String,
    description: String
})

const noteModel = mongoose.model("note", noteSchema)/*if we want to use any crud operatino then we will have to create a noteModel */

module.exports = noteModel