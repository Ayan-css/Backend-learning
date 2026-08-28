// main task of this file is to create a server

const express = require("express");


const app = express()
app.use(express.json())

const notes = []; 
app.post('/notes',(req,res)=>{
    notes.push(req.body)

    res.status(201).json({message:"note created successfully"})
    
}) //this creates api called notes

app.get('/notes', (req,res)=>{
    res.status(200).json({
        message:"note fetched successfully",
        notes:notes
    })
})


app.delete("/notes/:index",(req,res)=>{ /* this : show that this is dynamic */
const index = req.params.index

delete notes[index ]

 res.status(200).json({
        message:"note deleted successfully",
        // notes:notes
    })

})

module.exports = app