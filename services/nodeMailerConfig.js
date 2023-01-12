const { createTransport } = require('nodemailer')
const envConfig = require('../envConfig')

const transporterGmail = createTransport({
    service: 'gmail',
    auth: {
        user: envConfig.admin_mail_verif,
        pass: envConfig.admin_mail_verif_password
    }
});

const transporterLR = createTransport({
    host: envConfig.admin_mail_outbound_host,
    port: envConfig.admin_mail_outbound_port,
    secure: true,
    auth: {
        user: envConfig.admin_mail_outbound,
        pass: envConfig.admin_mail_outbound_password
    }
});

module.exports = { transporterGmail, transporterLR }