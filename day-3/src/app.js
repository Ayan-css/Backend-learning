const express = require('express');
const noteModel = require('./models/note.model')
const app = express()
app.use(express.json())
/* following are the api we will be creating 
GET => /notes
POST => /notes
DELETE => /notes/:id
PATCH => /notes/:id
*/

const notes =[]

app.post('/notes',async (req,res)=>{
    const data = req.body
  await noteModel.create({
        title:data.title,
        description:data.description
    })
    res.status(201).json({
        message:"Note is created"
    })
})

app.get('/notes', async (req,res)=>{

    const notes = await noteModel.find() //this return array of object only

/* const notes =await noteModel.findOne({
    title:"test_title"
})
above method is used for finiding one specific data and it return an object instead of array of object
> also if condition is false then it will return Null
> this condition can be applied to find() if we want to retrive simillar 

find()=> [{},{}] or []
findOne() => {} or Null
*/

    res.status(200).json({
        message: "Notes fetched successfully",
        notes: notes
    })
})

app.delete('/notes/:id', async (req,res)=>{
    const id = req.params.id

    await noteModel.findOneAndDelete({
        _id : id
    })

    res.status(200).json({
        message: "Note Deleted Successfully"
    })
})


app.patch('/notes/:id', async (req,res)=>{
    const id = req.params.id
    const description = req.body.description

    await noteModel.findOneAndUpdate({
        _id : id
    },{
        description : description
    })

    res.status(200).json({
        message: "Note Updated successfully"
    })
})

module.exports = app