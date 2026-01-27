const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phonenumber: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^[6-9]\d{9}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    address: {
        type: String,
        required: true
    },
    connectiontype: {
        type: String,
        required: true,
        enum: ['Household', 'Commercial', 'Industry']
    },
    referenceid: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
