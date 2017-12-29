const nodemailer = require('nodemailer')

module.exports = {

  transporter: null,

  createTestInstance(){
    return new Promise((resolve, reject) => {
      nodemailer.createTestAccount((err, account) => {
        if (err) return reject(err)
        const transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: account.user, // generated ethereal user
            pass: account.pass, // generated ethereal password
          }
        })
        this.transporter = transporter
        return resolve(transporter)
      })
    })
  },

  sendEmail(options){
    return new Promise((resolve, reject) => {
      this.transporter.sendMail(options, (err, info) => {
          if (err) return reject(err)
          console.log('Message sent: %s', info.messageId)
          // Preview only available when sending through an Ethereal account
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
          // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
          // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
      })
    })
  },

  sendVerificationToken(to, token){
    return this.sendEmail({
      from: '"Authorization service" <no-reply@kunok.me>', // sender address
      to: to, // list of receivers
      subject: 'Email confirmation', // Subject line
      text: `Visit this link to confirm your email: https://localhost:3000/auth/confirm/${to}/${token}`, // plain text body
      html: `<a href="http://localhost:3000/auth/confirm/${to}/${token}">Click here to confirm your email</a>`, // html body
    })
  },

}
