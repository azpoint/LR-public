class ClientServiceDB {
    constructor (db, model) {
        this.db = db;
        this.model = model;
    }

    validateDiscount(emailDiscount, serialDiscount) {
        return this.db.then( _ => this.model.findOne({ email: emailDiscount, serial: serialDiscount}))
        .then(resp => { return resp })
    }

    getLastSerial() {
        return this.db.then( _ => this.model.find({}).sort({serial: -1}).limit(1)).then(resp => {
            return resp[0].serial
        })
    }

    newClient(clientData){
        return this.db.then( _ => this.model.create(clientData).then(resp => {
            return resp
        }))
    }

    getClient(findSerial) {
        return this.db.then( _ => this.model.findOne({ serial: findSerial}))
        .then(resp => { return resp })
    }
}

module.exports = ClientServiceDB;