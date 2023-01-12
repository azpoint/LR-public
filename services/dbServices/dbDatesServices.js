const nonWorkingDaysModel = require('../../db/models/nonWorkingDaysModel');
const reservedDaysModel = require('../../db/models/reserverdEventsModel');

class DatesServicesDB {
    constructor (db) {
        this.db = db
    }

    nonWorkingDays(){
        return this.db.then(_ => nonWorkingDaysModel.find({}))
        .then(resp => {
            const arrayToSend = []
            resp.forEach(day => {
                const dayEvent = {
                    date: day.date,
                    availableFrom: day.availableFrom ? day.availableFrom : false
                }

                arrayToSend.push(dayEvent)
            })

            return arrayToSend
        })
    }

    reservedEvents(){
        return this.db.then(_ => reservedDaysModel.find({}))
        .then(resp => {
            const arrayToSend = []
            resp.forEach(day => {
                const dayEvent = {
                    date: day.date,
                    time: day.time ? day.time : null
                }

                arrayToSend.push(dayEvent)
            })

            return arrayToSend
        })
    }

    reservedEventsSerial(){
        return this.db.then(_ => reservedDaysModel.find({}))
        .then(resp => {
            return resp
        })
    }

    saveEvents(bookingDays){
        return this.db.then(_ => reservedDaysModel.create(bookingDays)
        .then(resp => {
            return resp
        }))
    }
}

module.exports = DatesServicesDB;