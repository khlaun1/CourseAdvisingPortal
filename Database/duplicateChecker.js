// duplicateChecker.js

const db = require('./db');
/*
const checkDuplicateEmail = (dbconn) => async (req, res) => {
    const { email } = req.body;

    const query = 'SELECT COUNT(*) AS count FROM users WHERE email = ?';
    dbconn.query(query, [email], (err, results) => {
        if (err) {
            return res.status(500).send({ message: 'Error querying the database' });
        }

        const isDuplicate = results[0].count > 0;
        if (isDuplicate) {
            res.status(409).send({ message: 'User already exists, please login.' });
        } else {
            res.send({ isDuplicate: false });
            
        }
    });
};*/

// const checkDuplicateEmail = async (email, callback)=>{
//     //const {id, username, email, password} = req.body;
//     const query = 'SELECT COUNT(*) AS count FROM users WHERE email=?';
//     await db.dbconn.query(query, [email], (err, results)=>{
//         if(err){
//             console.error('Error querying and checking if the email exists or not', err);
//             callback(err);
//         }

//         const isDuplicate = results[0].count>0;
//         if(isDuplicate){
//             console.log('Duplicate email the email already exists');
//             callback(isDuplicate);
//         }
//         if(!isDuplicate){
//             console.log('The email is unique, inserting the email in database!');
//             callback(isDuplicate);
//         }

//     })
// } 
const checkDuplicateEmail = async (email) => {
    const query = 'SELECT COUNT(*) AS count FROM users WHERE email = ?';
    try {
        const [results] = await db.dbconn.query(query, [email]);
        const isDuplicate = results[0].count > 0;

        if (isDuplicate) {
            console.log('Duplicate email: the email already exists');
            
        } else {
            console.log('The email is unique, inserting the email in database!');
        }

        return isDuplicate;
    } catch (err) {
        console.error('Error querying and checking if the email exists or not', err);
        throw err;
    }
};



module.exports = checkDuplicateEmail;
