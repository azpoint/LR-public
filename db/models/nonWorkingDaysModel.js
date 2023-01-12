const { Schema, model } = require('mongoose');

const nonWorkingDaysSchema = new Schema({
    date: { type: String, required: true}, availableFrom: { type: Number}
})

module.exports = model('nonWorkingDay', nonWorkingDaysSchema)