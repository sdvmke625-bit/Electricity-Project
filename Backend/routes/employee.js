const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/User');
const Bill = require('../models/Bill');
const { calculateBillAmount } = require('../models/billCalculator');

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../Frontend/HTML_Files/employee.html'));
});

router.post('/generate-bill', async (req, res) => {
    try {
        const { referenceid, units } = req.body;
        const consumedUnits = Number(units);

        if (consumedUnits < 0 || isNaN(consumedUnits)) {
            return res.send(`<h3 style="color:red; text-align:center;">Invalid Units. Cannot be negative.</h3><div style="text-align:center;"><a href="/employee">Back</a></div>`);
        }

        const user = await User.findOne({ referenceid: referenceid.toUpperCase() });
        if (!user) {
            return res.send(`<h3 style="color:red; text-align:center;">Consumer not found with ID: ${referenceid}</h3><div style="text-align:center;"><a href="/employee">Back</a></div>`);
        }

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const existingBill = await Bill.findOne({
            consumer: user._id,
            month: currentMonth,
            year: currentYear
        });

        if (existingBill) {
            return res.send(`<h3 style="color:red; text-align:center;">Bill already generated for this month (${currentMonth + 1}/${currentYear}).</h3><div style="text-align:center;"><a href="/employee">Back</a></div>`);
        }

        const calculation = calculateBillAmount(consumedUnits);
        const billAmount = calculation.billAmount;
        const fineAmount = calculation.fine;

        const dueDate = new Date(today);
        dueDate.setDate(today.getDate() + 15);

        const newBill = new Bill({
            consumer: user._id,
            month: currentMonth,
            year: currentYear,
            unitsConsumed: consumedUnits,
            billAmount: billAmount,
            dueDate: dueDate,
            fineAmount: fineAmount
        });

        await newBill.save();

        const pendingBills = await Bill.find({
            consumer: user._id,
            status: 'Unpaid',
            _id: { $ne: newBill._id }
        });

        let totalPending = 0;
        pendingBills.forEach(b => totalPending += b.billAmount);

        res.send(`
            <div style="font-family: 'Segoe UI', sans-serif; max-width:600px; margin:30px auto; padding:30px; border:1px solid #ddd; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius:12px;">
                <div style="text-align:center; border-bottom: 2px solid #00acc1; padding-bottom: 15px; margin-bottom: 20px;">
                    <h2 style="color:#006064; margin:0;">Bill Generated Successfully</h2>
                    <p>Date: ${today.toLocaleDateString()}</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <p><b>Consumer:</b> ${user.name} (${user.referenceid})</p>
                    <p><b>Units Consumed:</b> ${consumedUnits} kWh</p>
                    <p><b>Current Bill Amount:</b> ₹${billAmount.toFixed(2)}</p>
                    <p><b>Due Date:</b> ${dueDate.toLocaleDateString()}</p>
                    <p style="color: #d32f2f;"><b>Amount after Due Date (with Fine):</b> ₹${(billAmount + fineAmount).toFixed(2)}</p>
                </div>

                ${totalPending > 0 ? `
                <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ffe0b2;">
                    <h3 style="margin:0; color: #e65100;">Previous Pending Dues: ₹${totalPending.toFixed(2)}</h3>
                    <p style="font-size:0.9rem; margin:5px 0 0 0;">(Across ${pendingBills.length} unpaid previous bills)</p>
                </div>
                ` : ''}

                <div style="background: #e0f7fa; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                    <h2 style="margin:0; color: #006064;">Total Payable: ₹${(billAmount + totalPending).toFixed(2)}</h2>
                </div>

                <div style="text-align:center;">
                    <a href="/employee" style="padding:10px 20px; background:#00acc1; color:white; text-decoration:none; border-radius:5px;">Generate Another</a>
                </div>
            </div>
        `);

    } catch (err) {
        console.error(err);
        res.send(`<h3 style="color:red; text-align:center;">Error: ${err.message}</h3><div style="text-align:center;"><a href="/employee">Back</a></div>`);
    }
});

module.exports = router;
