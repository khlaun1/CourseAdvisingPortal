// duplicateChecker.js

const db = require("./db");

const checkDuplicateEmail = async (email) => {
  const query = "SELECT COUNT(*) AS count FROM users WHERE email = ?";
  try {
    const [results] = await db.dbconn.query(query, [email]);
    const isDuplicate = results[0].count > 0;

    if (isDuplicate) {
      console.log("Duplicate email: the email already exists");
    } else {
      console.log("The email is unique, inserting the email in database!");
    }

    return isDuplicate;
  } catch (err) {
    console.error(
      "Error querying and checking if the email exists or not",
      err
    );
    throw err;
  }
};

module.exports = checkDuplicateEmail;
