const express = require('express');
const multer = require("multer");
const postModel = require("./models/post.model")
const uploadFile = require('./services/storage.service')

const app = express();
app.use(express.json())

const upload = multer({storage:multer.memoryStorage()});

app.post("/create-post",upload.single("file"),async (req,res)=>{
    console.log(req.file);
    console.log(req.body);

    const result = await uploadFile(req.file.buffer)
    const post = await postModel.create({
        image:result.url,
        caption: req.body.caption
    })
    

    return res.status(201).json({
        message:"Post created successfully",
        post
    })
    //  console.log("FILE CONTENT TYPE:", req.body.mimetype);

})
app.get("/posts", async (req,res)=>{
    const posts = await postModel.find()

    return res.status(200).json({
        message:"Post fetched suvvessfully",
        posts
    })
})


module.exports = app