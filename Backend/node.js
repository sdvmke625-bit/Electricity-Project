const express = require("express");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
mongoose.connect("mongodb://127.0.0.1:27017/electricitydb")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));
const loginschema = new mongoose.Schema({
    name : String,
    referenceid : {
        type: String,
        unique: true,
        required: true
    },
    presentbillingdate : {
        type: Date,
        default: () => new Date("2026-01-01") 
    },
    prevbillingdate : {
        type: Date,
        default: Date.now
    },
    phonenumber : Number
});
const User = mongoose.model("User",loginschema);
app.post("/login",async(req,res)=>{
    const user = new User(req.body);
    user.save();
    res.send("Data is stored in Database");
});
app.listen(4000, () => {
  console.log("Server running on port 3000");
});
