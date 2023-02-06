const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = 'pcgamesonline3@gmail.com';
  }
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // sendgrid
      // console.log(process.env.NODE_ENV);
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send(template, subject) {
    //Send the Actual mail
    // 1) Render HTML based on the pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject
      }
    );

    // 2) Define Email Options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
      // html:
    };
    // Create a transport and Send Email

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('Welcome', 'Welcome to the natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your Password Reset Token (Valid For Only 10 minutes)'
    );
  }
};
