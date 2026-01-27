const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/User');
const Bill = require('../models/Bill');

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../Frontend/HTML_Files/resident.html'));
});

router.post('/view-bill', async (req, res) => {
    try {
        const { referenceid } = req.body;
        const user = await User.findOne({ referenceid: referenceid.toUpperCase() });

        if (!user) {
            return res.send(`<h3 style="color:red; text-align:center;">No record found for ID: ${referenceid}</h3><div style="text-align:center;"><a href="/consumer">Try Again</a></div>`);
        }

        const latestBill = await Bill.findOne({ consumer: user._id }).sort({ year: -1, month: -1 });

        const pendingBills = await Bill.find({ consumer: user._id, status: 'Unpaid' }).sort({ year: 1, month: 1 });

        let totalPending = 0;
        let fineTotal = 0;
        const now = new Date();

        pendingBills.forEach(b => {
            let amount = b.billAmount;
            if (b.status === 'Unpaid' && now > b.dueDate) {
                amount += b.fineAmount;
                fineTotal += b.fineAmount;
            }
            totalPending += amount;
        });

        if (!latestBill) {
            return res.send(`
                 <div style="font-family: 'Segoe UI', sans-serif; max-width:600px; margin:50px auto; padding:30px; border:1px solid #ddd; border-radius:12px; text-align:center;">
                    <h2 style="color:#f57c00;">Bill Not Generated Yet</h2>
                    <p>No billing data is available for <b>${user.name}</b> (${user.referenceid}).</p>
                    <br>
                    <a href="/consumer" style="color:#555; text-decoration:none;">Back</a>
                 </div>
             `);
        }

        const isLatestPaid = latestBill.status === 'Paid';

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
                        Bill Month: ${latestBill.month + 1}/${latestBill.year}
                    </div>
                </div>

                <div style="background: #fafafa; padding: 20px; border-radius: 8px; margin-bottom: 30px; border:1px solid #eee;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <span>Units Consumed (Latest):</span>
                        <b>${latestBill.unitsConsumed} kWh</b>
                    </div>
                     <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <span>Current Bill Amount:</span>
                        <b>₹${latestBill.billAmount.toFixed(2)}</b>
                    </div>
                     <div style="display:flex; justify-content:space-between; margin-bottom:10px; color: #d32f2f;">
                        <span>Due Date:</span>
                        <b>${latestBill.dueDate.toLocaleDateString()}</b>
                    </div>
                </div>

                ${totalPending > 0 ? `
                 <div style="background: #e0f7fa; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                    <h2 style="margin:0; color: #006064;">Total Payable: ₹${totalPending.toFixed(2)}</h2>
                    <p style="margin:5px 0 0 0; font-size:0.9rem;">(Includes all pending bills)</p>
                    ${fineTotal > 0 ? `<p style="margin:5px 0 0 0; color: #d32f2f; font-weight:bold;">Includes Late Fines: ₹${fineTotal.toFixed(2)}</p>` : ''}
                </div>
                ` : `
                 <div style="text-align:center; color:green; font-weight:bold; font-size:1.1rem; border:1px solid green; padding:10px; border-radius:8px; background:#f1f8e9; margin-bottom:20px;">
                        ✓ No Pending Dues
                </div>
                `}

                ${totalPending > 0 ? `
                    <form action="/pay-bill" method="post" style="text-align:center;">
                        <input type="hidden" name="referenceid" value="${user.referenceid}">
                        <button type="submit" style="padding:15px 40px; background:#00acc1; color:white; border:none; border-radius:8px; cursor:pointer; font-size:1.1rem; font-weight:bold; box-shadow:0 4px 6px rgba(0,0,0,0.1);">Pay Total Due</button>
                    </form>
                ` : ''}
                
                <div style="text-align:center; margin-top: 30px;">
                    <a href="/consumer" style="color:#777; text-decoration:none;">&larr; Back to Home</a>
                </div>
             </div>
        `);

    } catch (e) {
        console.error(e);
        res.send(`<h3 style="color:red; text-align:center;">Error: ${e.message}</h3><div style="text-align:center;"><a href="/consumer">Back</a></div>`);
    }
});

router.post('/pay-bill', async (req, res) => {
    try {
        const { referenceid } = req.body;
        const user = await User.findOne({ referenceid });

        if (!user) return res.send("User not found");

        await Bill.updateMany(
            { consumer: user._id, status: 'Unpaid' },
            {
                status: 'Paid',
                paymentDate: new Date()
            }
        );

        res.send(`
             <div style="text-align:center; padding:50px; font-family:sans-serif;">
                <div style="font-size:4rem; color:green; margin-bottom:10px;">✓</div>
                <h1 style="color:#333;">Payment Successful!</h1>
                <p style="color:#555;">All pending dues have been cleared.</p>
                <br>
                <a href="/consumer" style="padding:10px 20px; background:#00acc1; color:white; text-decoration:none; border-radius:5px;">Back to Home</a>
             </div>
        `);
    } catch (e) {
        res.send("Error processing payment: " + e.message);
    }
});

module.exports = router;
