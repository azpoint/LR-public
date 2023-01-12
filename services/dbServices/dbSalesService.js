const { then } = require("../../db/mongoConnect");

class SalesServiceDB {
    constructor (db, model) {
        this.db = db;
        this.model = model;
    }

    newSale(saleData){
        return this.db.then( _ => this.model.create(saleData)).then(resp => {
            return resp
        })
    }

    lastOrder(){
        return this.db.then(_ => this.model.find({}).sort({orderNumber: -1}).limit(1))
        .then(resp => {
            return resp[0].orderNumber
        })
    }

    getSale(findSerial){
        return this.db.then(_ => this.model.find({serial: findSerial}).limit(1))
        .then(resp => {
            return resp[0]
        })
    }

    verifCarFile(findOrderNumber) {
        return this.db.then(_ => this.model.findOne({orderNumber: findOrderNumber}))
        .then(resp => {
            if(resp === null){
                throw new Error("Invalid Data");
            } else {
                if(resp.carFileAttempts === -1){
                    return 'Not valid access'
                } else if(resp.carFileAttempts >= 0 && resp.carFileAttempts < 3){
                    resp.carFileAttempts = ++resp.carFileAttempts
                    resp.save()
                    return 'next'
                } else if(resp.carFileAttempts >= 3){
                    return 'limit'
                }
            }
        })
    }

}

module.exports = SalesServiceDB;