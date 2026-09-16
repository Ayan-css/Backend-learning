const express = require('express');
const multer = require("multer");


const app = express();
app.use(express.json())

const upload = multer({storage:multer.memoryStorage()});

app.post("/create-post",upload.single("file"),async (req,res)=>{
    console.log(req.file);
    console.log(req.body);
    //  console.log("FILE CONTENT TYPE:", req.body.mimetype);

})//this part is needed to be fixed


module.exports = app