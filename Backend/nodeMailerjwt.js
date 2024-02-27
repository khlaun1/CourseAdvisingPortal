const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();


const generateToken = (user) => {
    const secret = process.env.SECRET_KEY;
    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '15min' }); 
    return token;
};


const sendVerificationEmail = (user, token) => {
    //console.log('tis user', user[0])
    //console.log('This is user in nodemailer ', user[0][0].email)
    const transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
            user: 'khpa34229@gmail.com',
            pass: process.env.PASS_KEY 
        }
    });

    const mailOptions = {
        from: 'khpa34229@gmail.com',
        to: user[0][0].email,
        subject: 'Verify your account',
        html: `<p>Click <a href="http://localhost:3001/profile/${token}">here</a> to verify your account</p>` 
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};



module.exports = {
    generateToken,
    sendVerificationEmail
}
