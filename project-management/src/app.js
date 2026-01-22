import express from "express"
import cors from "cors"
const app = express()

// Basic configurations
app.use(express.json({ limit: "16kb"}))
app.use(express.urlencoded({ extended: true, limit: "16kb"}))
app.use(express.static("public"))

// cors configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",")|| "https://localhost:5173",
    credentials:true,
    methods: ["GET","POST","PUT","PACTH","DELETE","OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization"]
}))


app.get("/",(req, res) =>{
    res.send("welcome to basecampy")
})

export default app