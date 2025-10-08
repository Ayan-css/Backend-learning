import dotenv from 'dotenv'

dotenv.config({
    path:"./.env",
});
let myusername = process.env.username;

console.log("value: ", myusername);


console.log("start of backend project testing");

