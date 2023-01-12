const { Schema, model } = require('mongoose');

const saleSchema = new Schema({
    productCode: { type: String, required: true },
    amount: { type: Number, required: true },
    serial: { type: Number, required: true },
    orderNumber: { type: Number, required: true},
    clientUTC: {type: Number},
    bookingDates: {type:[{date: {type: String}, time:{type:Number}}], default: undefined},
    delivered: { type: Boolean, required: true },
    carFileAttempts: { type: Number, required: true },
    bookFileAttemps: { type: Number, required: true }
}, { timestamps: true})

module.exports = model("sale", saleSchema)