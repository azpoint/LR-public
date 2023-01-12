const envConfig = {
    host: process.env.HOST || 'localhost',
    port: Number(process.env.PORT) || 9090,
    admin_mail_outbound: process.env.ADMIN_MAIL_OUTBOUND,
    admin_mail_outbound_password: process.env.ADMIN_MAIL_OUTBOUND_PASSWORD,
    admin_mail_outbound_host: process.env.ADMIN_MAIL_OUTBOUND_HOST,
    admin_mail_outbound_port: process.env.ADMIN_MAIL_OUTBOUND_PORT || 587,
    admin_mail_verif: process.env.ADMIN_MAIL_VERIF,
    admin_mail_verif_password: process.env.ADMIN_MAIL_VERIF_PASSWORD,
    admin_mail_verif_host: process.env.ADMIN_MAIL_VERIF_HOST,
    admin_mail_verif_port: process.env.ADMIN_MAIL_VERIF_PORT,
    stripe_pub_key: process.env.STRIPE_PUB_KEY,
    stripe_priv_key: process.env.STRIPE_PRIV_KEY,
    session_secret: process.env.SESSION_SECRET || 'felice'
}

module.exports = envConfig