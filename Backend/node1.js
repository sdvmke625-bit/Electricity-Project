const express = require("express");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
mongoose.connect("mongodb://127.0.0.1:27017/electricitydb")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));
const UserSchema = new mongoose.Schema({
  name: String,
  referenceid: String,
  prevbillingdate: Date,
  presentbillingdate: Date
});
const User = mongoose.model("User", UserSchema);
app.post("/update",async (req,res) => {
    const { referenceid, units } = req.body;

  const user = await User.findOne({ referenceid });

  if (!user) {
    return res.send("No record found");
  }

  const oldBillingDate = user.prevbillingdate;
  const today = new Date();
  const diffTime = today - oldBillingDate;
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  var billAmount = 0;
  var x = 1.5
  for(var i =1;i<=days;i++)
  {
        billAmount = billAmount + x;
        if(i%50 == 0)
        {
            x = x+0.50;
        }
        
  }

  await User.updateOne(
    { referenceid },
    {
      $set: {
        prevbillingdate: today
      }
    }
  );

  res.send(`
    Bill Generated Successfully <br>
    Name : ${user.name}
    Reference ID : ${user.referenceid}
    Days: ${days} <br>
    Amount: ₹${billAmount}
  `);
});
app.listen(4000, () => {
  console.log("Server running on port 4000");
});