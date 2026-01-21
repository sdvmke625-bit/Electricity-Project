const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../Frontend")));

mongoose.connect("mongodb://127.0.0.1:27017/electricitydb")
  .then(async () => {
    console.log("MongoDB Connected");
  })
  .catch(err => console.error("MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phonenumber: { type: String, required: true },
  address: { type: String, required: true },
  connectiontype: {
    type: String,
    required: true,
    enum: ['Household', 'Commercial', 'Industry']
  },
  referenceid: { type: String, required: true, unique: true, uppercase: true },
  prevbillingdate: { type: Date, default: Date.now },
  status: { type: String, default: 'No Bill' },
  lastBillAmount: { type: Number, default: 0 },
  lastUnitsConsumed: { type: Number, default: 0 },
  billGeneratedDate: { type: Date }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/HTML_Files/login.html"));
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin123") {
    res.redirect("/admin");
  } else if (username === "employee" && password === "emp123") {
    res.redirect("/employee");
  } else {
    res.send(`<h3 style="color:red; text-align:center; margin-top:50px;">Invalid Credentials</h3><div style="text-align:center;"><a href="/">Try Again</a></div>`);
  }
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/HTML_Files/admin.html"));
});

app.post("/register", async (req, res) => {
  try {
    const { name, phonenumber, address, connectiontype, referenceid } = req.body;

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phonenumber)) {
      return res.send(`<h3 style="color:red; text-align:center;">Invalid Phone Number. Must be 10 digits starting with 6-9.</h3><div style="text-align:center;"><a href="/admin">Back</a></div>`);
    }

    const refRegex = /^EB[A-Za-z0-9]{5,10}$/i;
    if (!refRegex.test(referenceid)) {
      return res.send(`<h3 style="color:red; text-align:center;">Invalid Reference ID. Must start with EB.</h3><div style="text-align:center;"><a href="/admin">Back</a></div>`);
    }

    if (await User.findOne({ referenceid: referenceid.toUpperCase() })) {
      return res.send(`<h3 style="color:red; text-align:center;">Reference ID already exists</h3><div style="text-align:center;"><a href="/admin">Back</a></div>`);
    }

    const user = new User({
      name, phonenumber, address, connectiontype,
      referenceid: referenceid.toUpperCase()
    });

    await user.save();

    res.send(`
      <div style="text-align:center; padding:40px; font-family: sans-serif;">
        <h2 style="color: #00acc1;">Registration Successful!</h2>
        <p>Consumer: <b>${user.name}</b></p>
        <p>ID: <b>${user.referenceid}</b></p>
        <br>
        <a href="/admin" style="padding:10px 20px; background:#00acc1; color:white; text-decoration:none; border-radius:5px;">Add Another</a>
      </div>
    `);
  } catch (err) {
    res.send(`<h3 style="color:red; text-align:center;">Error: ${err.message}</h3><div style="text-align:center;"><a href="/admin">Back</a></div>`);
  }
});

app.get("/employee", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/HTML_Files/employee.html"));
});

app.post("/generate-bill", async (req, res) => {
  try {
    const { referenceid, units } = req.body;
    const consumedUnits = Number(units);

    if (consumedUnits < 0) {
      return res.send(`<h3 style="color:red; text-align:center;">Units cannot be negative.</h3><div style="text-align:center;"><a href="/employee">Back</a></div>`);
    }

    const user = await User.findOne({ referenceid: referenceid.toUpperCase() });
    if (!user) {
      return res.send(`<h3 style="color:red; text-align:center;">Consumer not found</h3><div style="text-align:center;"><a href="/employee">Back</a></div>`);
    }

    const prevDate = user.prevbillingdate;
    const today = new Date();
    let billAmount = 0;

    if (user.connectiontype === 'Household') {
      let remaining = consumedUnits;
      if (remaining > 0) { const u = Math.min(remaining, 50); billAmount += u * 3.00; remaining -= u; }
      if (remaining > 0) { const u = Math.min(remaining, 50); billAmount += u * 4.50; remaining -= u; }
      if (remaining > 0) { const u = Math.min(remaining, 100); billAmount += u * 6.00; remaining -= u; }
      if (remaining > 0) { billAmount += remaining * 7.50; }
      billAmount += 50;
    } else if (user.connectiontype === 'Commercial') {
      billAmount = (consumedUnits * 10.00) + 100;
    } else if (user.connectiontype === 'Industry') {
      billAmount = (consumedUnits * 15.00) + 500;
    }

    user.lastBillAmount = billAmount;
    user.lastUnitsConsumed = consumedUnits;
    user.billGeneratedDate = today;
    user.prevbillingdate = today;
    user.status = 'Unpaid';
    await user.save();

    res.send(`
      <div style="font-family: 'Segoe UI', sans-serif; max-width:600px; margin:30px auto; padding:30px; border:1px solid #ddd; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius:12px;">
        <div style="text-align:center; border-bottom: 2px solid #00acc1; padding-bottom: 15px; margin-bottom: 20px;">
            <h2 style="color:#006064; margin:0;">Bill Generated Successfully</h2>
        </div>
        
        <div style="background: #e0f7fa; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h3 style="margin:0; color: #006064;">Amount: ₹${billAmount.toFixed(2)}</h3>
        </div>

        <div style="text-align:center;">
          <a href="/employee" style="padding:10px 20px; background:#00acc1; color:white; text-decoration:none; border-radius:5px;">Generate Another</a>
        </div>
      </div>
    `);
  } catch (err) {
    res.send(`<h3 style="color:red; text-align:center;">Error: ${err.message}</h3><div style="text-align:center;"><a href="/employee">Back</a></div>`);
  }
});

app.get("/consumer", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/HTML_Files/resident.html"));
});

app.post("/view-bill", async (req, res) => {
  try {
    const { referenceid } = req.body;
    const user = await User.findOne({ referenceid: referenceid.toUpperCase() });

    if (!user) {
      return res.send(`<h3 style="color:red; text-align:center;">No record found for ID: ${referenceid}</h3><div style="text-align:center;"><a href="/consumer">Try Again</a></div>`);
    }

    if (user.status === 'No Bill') {
      return res.send(`
                 <div style="font-family: 'Segoe UI', sans-serif; max-width:600px; margin:50px auto; padding:30px; border:1px solid #ddd; border-radius:12px; text-align:center;">
                    <h2 style="color:#f57c00;">Bill Not Generated Yet</h2>
                    <p>No billing data is available for <b>${user.name}</b> (${user.referenceid}).</p>
                    <p>Please check back later or contact the office.</p>
                    <br>
                    <a href="/consumer" style="color:#555; text-decoration:none;">Back</a>
                 </div>
             `);
    }

    res.send(`
             <div style="font-family: 'Segoe UI', sans-serif; max-width:700px; margin:30px auto; padding:40px; border:1px solid #ddd; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-radius:12px; background:#fff;">
                <div style="text-align:center; border-bottom: 3px solid #00acc1; padding-bottom: 20px; margin-bottom: 30px;">
                    <h1 style="color:#006064; margin:0; font-size:2rem;">Electricity Bill</h1>
                    <p style="margin:5px 0 0 0; color:#555;">Telangana State Southern Power Distribution Company Limited</p>
                </div>
                
                 <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; font-size:1.05rem;">
                    <div>
                        <strong style="color:#00acc1;">Consumer Details</strong><br>
                        Name: ${user.name}<br>
                        Phone: ${user.phonenumber}<br>
                        Address: ${user.address}
                    </div>
                    <div style="text-align:right;">
                        <strong style="color:#00acc1;">Connection Info</strong><br>
                        Ref ID: <b>${user.referenceid}</b><br>
                        Type: ${user.connectiontype}<br>
                        Bill Date: ${user.billGeneratedDate ? user.billGeneratedDate.toLocaleDateString() : 'N/A'}
                    </div>
                </div>

                <div style="background: #fafafa; padding: 20px; border-radius: 8px; margin-bottom: 30px; border:1px solid #eee;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <span>Units Consumed:</span>
                        <b>${user.lastUnitsConsumed} kWh</b>
                    </div>
                     <div style="display:flex; justify-content:space-between; font-size:1.4rem; color:#d32f2f; border-top:1px solid #ddd; padding-top:10px;">
                        <span>Total Amount:</span>
                        <b>₹${user.lastBillAmount.toFixed(2)}</b>
                    </div>
                </div>

                <div style="text-align:center; margin-bottom: 10px;">
                     <div style="font-size: 1.2rem; margin-bottom: 20px;">
                        Status: 
                        <span style="font-weight:bold; padding:5px 10px; border-radius:4px; color:${user.status === 'Paid' ? 'green' : 'white'}; background:${user.status === 'Paid' ? '#e8f5e9' : '#d32f2f'}">
                            ${user.status}
                        </span>
                     </div>
                </div>

                ${user.status === 'Unpaid' ? `
                    <form action="/pay-bill" method="post" style="text-align:center;">
                        <input type="hidden" name="referenceid" value="${user.referenceid}">
                        <button type="submit" style="padding:15px 40px; background:#00acc1; color:white; border:none; border-radius:8px; cursor:pointer; font-size:1.1rem; font-weight:bold; box-shadow:0 4px 6px rgba(0,0,0,0.1);">Pay Bill Now</button>
                    </form>
                ` : `
                    <div style="text-align:center; color:green; font-weight:bold; font-size:1.1rem; border:1px solid green; padding:10px; border-radius:8px; background:#f1f8e9;">
                        ✓ This bill has been paid.
                    </div>
                `}
                
                <div style="text-align:center; margin-top: 30px;">
                    <a href="/consumer" style="color:#777; text-decoration:none;">&larr; Back to Home</a>
                </div>
             </div>
        `);
  } catch (e) {
    res.send(`<h3 style="color:red; text-align:center;">Error: ${e.message}</h3>`);
  }
});

app.post("/pay-bill", async (req, res) => {
  try {
    const { referenceid } = req.body;
    await User.findOneAndUpdate({ referenceid }, { status: 'Paid' });
    res.send(`
             <div style="text-align:center; padding:50px; font-family:sans-serif;">
                <div style="font-size:4rem; color:green; margin-bottom:10px;">✓</div>
                <h1 style="color:#333;">Payment Successful!</h1>
                <p style="color:#555;">Your transaction has been processed.</p>
                <br>
                <a href="/consumer" style="padding:10px 20px; background:#00acc1; color:white; text-decoration:none; border-radius:5px;">Back to Home</a>
             </div>
        `);
  } catch (e) {
    res.send("Error processing payment");
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});