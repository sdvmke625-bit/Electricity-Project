const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    consumer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    month: {
        type: Number, // 0-11
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    unitsConsumed: {
        type: Number,
        required: true,
        min: 0
    },
    billAmount: {
        type: Number,
        required: true,
        min: 0
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Paid', 'Unpaid'],
        default: 'Unpaid'
    },
    fineAmount: {
        type: Number,
        default: 150
    },
    paymentDate: {
        type: Date
    },
    generatedDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Ensure unique bill per consumer per month
billSchema.index({ consumer: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Bill", billSchema);
