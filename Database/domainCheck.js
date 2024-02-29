// domainCheck.js


const validateEmailDomain = (db) => (req, res) => {
    const email = req.body.email;
    const domain = email.split('@')[1]; // Extract the domain from the email

    if (!domain) {
        return res.status(400).send({ message: 'Invalid email' });
    }

    const query = 'SELECT COUNT(*) AS count FROM domains WHERE domain = ?';
    db.query(query, [domain], (err, results) => {
        if (err) {
            return res.status(500).send({ message: 'Error querying the database' });
        }

        const domainExists = results[0].count > 0;
        res.send({ isValidDomain: domainExists });
    });
};

module.exports = validateEmailDomain;
