const { Schema, model } = require('mongoose')

const productSchema = new Schema({
    productCode: { type: String, required: true },
    productName: { type: String, required: true },
    language: { type: String, required: true, maxLength: 2, minLength: 2 },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    isbn: { type: String, required: true },
    cover: { type: String, required: true },
    review: { value: { type: Number, min: 0, max: 10 }, text: { type: String }, reviwerName: { type: String }} 
})

module.exports = model("product", productSchema)

