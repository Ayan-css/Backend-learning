const express = require("express")
const multer = require("multer")
const postModel = require("./models/post.model")
const uploadFile = require("./services/storage.service")

const upload = multer({
    storage:multer.memoryStorage()
})

const app = express();
app.use(express.json())


app.post("/create-post",upload.single("file"),async (req,res)=>{
        console.log(req.body);
        console.log(req.file);

        const result = await uploadFile(req.file.buffer)
        const post = await postModel.create({
            image: result.url,
            caption: req.body.caption
        })
        
        return res.status(201).json({
            message: "post created successfull",
            post
        })
})


app.get("/posts",async (req,res)=>{
    const posts = await postModel.find()
    
    return res.status(200).json({
        message: "post fetched successfully",
        posts
    })
})


module.exports = app