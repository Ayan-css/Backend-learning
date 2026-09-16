require("dotenv").config()
const app = require("./src/app")
const connectDB = require("./src/db/db")

app.listen(3000, ()=>{
    console.log("server is listening on port 3000");
})

connectDB()