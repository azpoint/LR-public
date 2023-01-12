class ProductServiceDB {
    constructor (db, model) {
        this.db = db;
        this.model = model;
    }

    getAllProducts() {
        return this.db.then( _ => this.model.find({}).sort({ price: -1, language: 1 }))
        .then( resp => { return resp })
    }

    getOneProduct(productCodeIn) {
        return this.db.then( _ => this.model.findOne({ productCode: productCodeIn }))
        .then( resp => { return resp })
    }
}

module.exports = ProductServiceDB;