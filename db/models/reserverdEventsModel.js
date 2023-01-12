const { Schema, model } = require('mongoose');

const reservedEventsSchema = new Schema({
    date: { type: String, required: true }, 
    time: { type: Number, required: true }, 
    serial: { type: Number, required: true }
},{ timestamps: true})

module.exports = model('reservedEvents', reservedEventsSchema)