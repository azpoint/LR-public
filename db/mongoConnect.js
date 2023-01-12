const envConfig = require('../envConfig');
const mongoose = require('mongoose');
const { transporterGmail } = require("../services/nodeMailerConfig");


const URL = `mongodb://127.0.0.1:27017/lr-db`;


const connection = mongoose.connect(URL)
.then( resp => {

    resp.connection.on('error', (err) => {
        const mailOptions = {
            from: envConfig.admin_mail_verif,
            to: envConfig.admin_mail_outbound,
            subject: `LearnRhino DB Error`,
            html: `Hey! there was an error in the LR database! \n\n${err}`,
          }
        transporterGmail.sendMail(mailOptions, function (error) {
            if(error){
                return console.log('DB error mail not sent')
            }
        })
     })

    resp.connection.on('disconnected', () => {
        const mailOptions = {
            from: envConfig.admin_mail_verif,
            to: envConfig.admin_mail_outbound,
            subject: `LearnRhino DB Disconnected`,
            html: `Hey! The LearRhino DB was disconnected`,
          }

        transporterGmail.sendMail(mailOptions, function (error) {
            if(error){
                return console.log('DB error mail not sent')
            }
        })
    })

    console.log('Connected to the Database')

}).catch( e => {
    const mailOptions = {
        from: envConfig.admin_mail_verif,
        to: envConfig.admin_mail_outbound,
        subject: `LearnRhino DB Connection Error`,
        html: `Hey! there was an error connecting to the LearnRhino DB`,
      }
    transporterGmail.sendMail(mailOptions, function (error) {
        if(error){
            return console.log('DB error mail not sent')
        }
    })
})

module.exports = connection