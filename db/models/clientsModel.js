const { Schema, model } = require('mongoose')


const clientSchema = new Schema({
    email: { type: String, require: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    serial: { type: Number, required: true },
    bookPassword: { type: String, required: true },
    address: { country: { type: String, required: true }, city: { type: String, required: true }},
    phone: { type: String, required: true },
    purchases: [ { productCode: { type: String, required: true }, orderNumber: { type: Number, required: true }, review: { value: { type: Number, min: 0, max: 10 }, text: { type: String } } } ],
    notes: { type: String }
}, { timestamps: true })

module.exports = model("client", clientSchema)