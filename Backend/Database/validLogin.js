// duplicateChecker.js

const db = require('./db');

const validEmail = (email, callback)=>{
    //const {id, username, email, password} = req.body;
    const query = 'SELECT COUNT(*) AS count FROM users WHERE email=?';
    db.dbconn.query(query, [email], (err, results)=>{
        if(err){
            console.error('Error querying and checking if the email exists or not', err);
            callback(err);
        }

        const isValidEmail = results[0].count>0;
        if(isValidEmail){
            console.log('The Email is valid');
            callback(isValidEmail);
        }
        if(!isValidEmail){
            console.log('The email entered was invalid');
            callback(isValidEmail);
        }

    })
} 

module.exports = validEmail;
