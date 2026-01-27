const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/User');

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../Frontend/HTML_Files/admin.html'));
});

router.post('/register', async (req, res) => {
    try {
        const { name, phonenumber, address, connectiontype, referenceid } = req.body;

        if (!/^[A-Za-z\s]+$/.test(name)) {
            return res.send(`<h3 style="color:red; text-align:center;">Invalid Name. Only alphabets allowed.</h3><div style="text-align:center;"><a href="/admin">Back</a></div>`);
        }

        if (!/^[0-9]{10}$/.test(phonenumber)) {
            return res.send(`<h3 style="color:red; text-align:center;">Invalid Phone Number. Must be exactly 10 digits.</h3><div style="text-align:center;"><a href="/admin">Back</a></div>`);
        }

        const existingUser = await User.findOne({ referenceid: referenceid.toUpperCase() });
        if (existingUser) {
            return res.send(`<h3 style="color:red; text-align:center;">Reference ID already exists</h3><div style="text-align:center;"><a href="/admin">Back</a></div>`);
        }

        const user = new User({
            name,
            phonenumber,
            address,
            connectiontype,
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
        if (err.name === 'ValidationError') {
            return res.send(`<h3 style="color:red; text-align:center;">Validation Error: ${err.message}</h3><div style="text-align:center;"><a href="/admin">Back</a></div>`);
        }
        if (err.code === 11000) {
            return res.send(`<h3 style="color:red; text-align:center;">Duplicate Entry Found</h3><div style="text-align:center;"><a href="/admin">Back</a></div>`);
        }
        res.send(`<h3 style="color:red; text-align:center;">Error: ${err.message}</h3><div style="text-align:center;"><a href="/admin">Back</a></div>`);
    }
});

module.exports = router;
