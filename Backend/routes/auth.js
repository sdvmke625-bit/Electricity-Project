const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../Frontend/HTML_Files/login.html'));
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === "admin" && password === "admin123") {
        res.redirect("/admin");
    } else if (username === "employee" && password === "emp123") {
        res.redirect("/employee");
    } else {
        res.send(`<h3 style="color:red; text-align:center; margin-top:50px;">Invalid Credentials</h3><div style="text-align:center;"><a href="/">Try Again</a></div>`);
    }
});

module.exports = router;
