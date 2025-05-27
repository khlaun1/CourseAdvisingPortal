const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Database connection pool
const dbconn = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Rahul@12345.p",
  database: process.env.DB_NAME || "course_advising_portal",
  port: process.env.DB_PORT || 3306,
});

// Function to create the users table with all required columns
const tableCreator = async () => {
  const tableCreation = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      admin BOOLEAN DEFAULT 0,
      loginToken VARCHAR(255) DEFAULT NULL
    )`;
  try {
    await dbconn.query(tableCreation);
    console.log("Table 'users' created or already exists"); 
  } catch (err) {
    console.error("Error creating table 'users'", err);
    throw err;
  }
};

// Function to create the admin table
const createAdminTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS admin (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userreq VARCHAR(255) NOT NULL,
      approval BOOLEAN DEFAULT FALSE
    )`;
  try {
    await dbconn.query(query);
    console.log("Table 'admin' created or already exists");
  } catch (err) {
    console.error("Error creating table 'admin'", err);
    throw err;
  }
};

// Function to create the questions table
const createTableQuestions = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS questions (
      questionid INT NOT NULL AUTO_INCREMENT,
      userid INT NOT NULL,
      questions VARCHAR(255) NOT NULL,
      PRIMARY KEY (questionid),
      FOREIGN KEY (userid) REFERENCES users(id)
    )`;
  try {
    await dbconn.query(query);
    console.log("Table 'questions' created or already exists");
  } catch (err) {
    console.error("Error creating table 'questions'", err);
    throw err;
  }
};

// Function to create the answers table
const createTableAnswers = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS answers (
      answerid INT AUTO_INCREMENT,
      questionid INT NOT NULL,
      userid INT NOT NULL,
      answer VARCHAR(255) NOT NULL,
      PRIMARY KEY (answerid),
      FOREIGN KEY (questionid) REFERENCES questions(questionid),
      FOREIGN KEY (userid) REFERENCES users(id)
    )`;
  try {
    await dbconn.query(query);
    console.log("Table 'answers' created or already exists");
  } catch (err) {
    console.error("Error creating table 'answers'", err);
    throw err;
  }
};

// Function to create the courses table
const createCoursesTableIfNotExists = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS courses (
      courseid INT PRIMARY KEY,
      coursename VARCHAR(100) NOT NULL,
      courselevel VARCHAR(50) NOT NULL,
      prerequisites JSON
    )`;
  try {
    await dbconn.query(sql);
    console.log("Table 'courses' created or already exists");
  } catch (error) {
    console.error("Error creating table 'courses'", error);
    throw error;
  }
};

// Function to create the advising table
const tableAdvising = async () => {
  const advisingQ = `
    CREATE TABLE IF NOT EXISTS advising (
      id INT PRIMARY KEY AUTO_INCREMENT,
      student_id INT NOT NULL,
      last_term VARCHAR(255),
      last_gpa DECIMAL(3,2),
      current_term VARCHAR(255),
      date_submitted DATE,
      status ENUM('approved', 'rejected', 'pending') DEFAULT 'pending',
      FOREIGN KEY (student_id) REFERENCES users(id)
    )`;
  try {
    await dbconn.query(advisingQ);
    console.log("Table 'advising' created or already exists");
  } catch (err) {
    console.error("Error creating table 'advising'", err);
    throw err;
  }
};

// Function to create the prerequisites table
const tableprereq = async () => {
  const prereqQ = `
    CREATE TABLE IF NOT EXISTS prerequisites (
      prerequisite_id INT PRIMARY KEY AUTO_INCREMENT,
      prerequisite_level VARCHAR(255) NOT NULL,
      prerequisite_name VARCHAR(255) NOT NULL,
      advising_record_id INT NOT NULL,
      FOREIGN KEY (advising_record_id) REFERENCES advising(id)
    )`;
  try {
    await dbconn.query(prereqQ);
    console.log("Table 'prerequisites' created or already exists");
  } catch (err) {
    console.error("Error creating table 'prerequisites'", err);
    throw err;
  }
};

// Function to create the courseplan table
const tableCourseplan = async () => {
  const courseplanQ = `
    CREATE TABLE IF NOT EXISTS courseplan (
      id INT PRIMARY KEY AUTO_INCREMENT,
      course_level VARCHAR(255) NOT NULL,
      course_name VARCHAR(255) NOT NULL,
      advising_record_id INT NOT NULL,
      FOREIGN KEY (advising_record_id) REFERENCES advising(id)
    )`;
  try {
    await dbconn.query(courseplanQ);
    console.log("Table 'courseplan' created or already exists");
  } catch (err) {
    console.error("Error creating table 'courseplan'", err);
    throw err;
  }
};

// Function to create the course_records table
const tableCourseRecords = async () => {
  const courseRecordsQ = `
    CREATE TABLE IF NOT EXISTS course_records (
      id INT PRIMARY KEY AUTO_INCREMENT,
      courseid INT,
      courselevel VARCHAR(255),
      coursename VARCHAR(255),
      studentid INT,
      FOREIGN KEY (courseid) REFERENCES courses(courseid),
      FOREIGN KEY (studentid) REFERENCES users(id)
    )`;
  try {
    await dbconn.query(courseRecordsQ);
    console.log("Table 'course_records' created or already exists");
  } catch (err) {
    console.error("Error creating table 'course_records'", err);
    throw err;
  }
};

// Function to create the advisingapproval table
const tableadvisingAdmin = async () => {
  const advisingAdminQ = `
    CREATE TABLE IF NOT EXISTS advisingapproval (
      student_id INT PRIMARY KEY NOT NULL,
      student_name VARCHAR(255) NOT NULL,
      status VARCHAR(255) DEFAULT 'pending' NOT NULL,
      FOREIGN KEY (student_id) REFERENCES users(id)
    )`;
  try {
    await dbconn.query(advisingAdminQ);
    console.log("Table 'advisingapproval' created or already exists");
  } catch (err) {
    console.error("Error creating table 'advisingapproval'", err);
    throw err;
  }
};

// Function to initialize the database schema
const initializeDatabase = async () => {
  try {
    await tableCreator(); // users
    await createAdminTable(); // admin
    await createCoursesTableIfNotExists(); // courses
    await tableAdvising(); // advising (references users)
    await tableprereq(); // prerequisites (references advising)
    await tableCourseplan(); // courseplan (references advising)
    await tableCourseRecords(); // course_records (references courses, users)
    await tableadvisingAdmin(); // advisingapproval (references users)
    await createTableQuestions(); // questions (references users)
    await createTableAnswers(); // answers (references questions, users)
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

// Function to check if a table exists
const existenceChecker = async (tableName) => {
  const tableChecker = `
    SELECT count(*) as count 
    FROM information_schema.tables 
    WHERE table_schema=? AND table_name=?`;
  try {
    const [result] = await dbconn.query(tableChecker, [process.env.DB_NAME || "course_advising_portal", tableName]);
    return result[0].count > 0;
  } catch (err) {
    console.error("Error checking if table exists", err);
    throw err;
  }
};

// Function for inserting data
const insertData = async (username, email, password, admin) => {
  const SignupInserter = `
    INSERT INTO users (username, email, password, admin, loginToken) 
    VALUES (?, ?, ?, ?, NULL)`;
  try {
    await dbconn.query(SignupInserter, [username, email, password, admin]);
  } catch (err) {
    console.error("Error running the insertion query", err);
    throw err;
  }
};

// Function to insert admin request
const adminInserter = async (email, callback) => {
  const adminQuery = "INSERT INTO admin (userreq, approval) VALUES (?, FALSE)";
  await dbconn.query(adminQuery, [email], (err) => {
    if (err) {
      console.error("Error running the insertion query");
      callback(err);
    }
    callback(null);
  });
};

// Function to check if admin request exists
const adminChecker = async (email) => {
  const adminCheckerQuery = "SELECT approval FROM admin WHERE userreq=?";
  const adminResults = await dbconn.query(adminCheckerQuery, [email]);
  return adminResults[0].length > 0;
};

// Function to get user by email
const getUserByEmail = async (email) => {
  const query = "SELECT * FROM users WHERE email = ?";
  const results = await dbconn.query(query, [email]);
  return results[0];
};

// Function to verify user credentials
const userVerifyer = async (email, password) => {
  const user = await getUserByEmail(email);
  if (!user) {
    return { success: false, message: "User Not Found" };
  }
  const match = await bcrypt.compare(password, user[0].password);
  return match
    ? { success: true, message: "password verified" }
    : { success: false, message: "incorrect password" };
};

// Function to delete admin request
const deleteReq = async (email) => {
  const deleteReqQuery = "DELETE FROM admin WHERE userreq=? AND approval=TRUE";
  await dbconn.query(deleteReqQuery, [email], (err) => {
    if (err) console.error("Error deleting the request");
  });
};

// Function to get user by email
const getId = async (email) => {
  const getIdQuery = "SELECT * FROM users WHERE email=?";
  const getIdResult = await dbconn.query(getIdQuery, [email]);
  return getIdResult;
};

// Function to get approval status
const getApprovalStatus = async (email) => {
  const getApprovalQuery = "SELECT approval FROM admin WHERE userreq=?";
  const getApprovalResult = await dbconn.query(getApprovalQuery, [email]);
  return getApprovalResult[0];
};

// Function to get user by ID
const getUserById = async (id) => {
  const query = "SELECT * FROM users WHERE id = ?";
  const results = await dbconn.query(query, [id]);
  return results[0];
};

// Function to update login token
const tokenUpdater = async (token, email) => {
  const tokenUpdation = "UPDATE users SET loginToken=? WHERE email=?";
  try {
    await dbconn.query(tokenUpdation, [token, email]);
  } catch (err) {
    console.error("Error updating the loginToken column of the users table");
    throw err;
  }
};

// Function to retrieve login token
const tokenRetriever = async (email) => {
  const tokenRetention = "SELECT loginToken FROM users WHERE email=?";
  try {
    const retr = await dbconn.query(tokenRetention, [email]);
    return retr[0];
  } catch (err) {
    console.error("Error retrieving the token!");
    throw err;
  }
};

// Function to delete login token
const tokenDeleter = async (email) => {
  const deletionQuery = "UPDATE users SET loginToken=NULL WHERE email=?";
  try {
    await dbconn.query(deletionQuery, [email]);
  } catch (err) {
    console.error("Error setting the token null");
  }
};

// Function to approve admin request
const backendAdminApprover = async (email) => {
  const approverQuery = "UPDATE admin SET approval=1 WHERE userreq=?";
  try {
    await dbconn.query(approverQuery, [email]);
  } catch (err) {
    console.error("Error updating the approval status in admin");
    throw err;
  }
};

// Function to validate admin status
const adminValidate = async (email) => {
  const adminValidateQuery = "SELECT admin FROM users WHERE email=?";
  try {
    const validationResult = await dbconn.query(adminValidateQuery, [email]);
    return validationResult[0];
  } catch (err) {
    console.error("Admin validation failed");
    throw err;
  }
};

// Function to view admin requests
const adminViewer = async () => {
  const adminViewerQuery = "SELECT * FROM admin";
  try {
    const adminViewerResult = await dbconn.query(adminViewerQuery);
    return adminViewerResult[0];
  } catch (err) {
    console.error("Error viewing the admin table");
    throw err;
  }
};

// Function to update password
const passwordUpdater = async (password, email) => {
  const updaterQuery = "UPDATE users SET password=? WHERE email=?";
  try {
    await dbconn.query(updaterQuery, [password, email]);
  } catch (err) {
    console.error("Error updating the password");
    throw err;
  }
};

// Function to add course prerequisite
const addPrerequisite = async (courseId, prerequisite) => {
  const [prereqExists] = await dbconn.query(
    `SELECT 1 FROM courses WHERE courseid = ? AND coursename = ? AND courselevel = ?`,
    [prerequisite.courseid, prerequisite.coursename, prerequisite.courselevel]
  );
  if (!prereqExists.length) {
    throw new Error("Prerequisite course does not exist");
  }
  const prerequisiteJSON = JSON.stringify(prerequisite);
  const [result] = await dbconn.execute(
    `UPDATE courses SET prerequisites = JSON_ARRAY_APPEND(prerequisites, '$', ?) WHERE courseid = ?`,
    [prerequisiteJSON, courseId]
  );
  return { updated: result.affectedRows === 1 };
};

// Function to remove course prerequisite
const removePrerequisite = async (courseId, prerequisite) => {
  const [courseData] = await dbconn.query(
    `SELECT prerequisites FROM courses WHERE courseid = ?`,
    [courseId]
  );
  if (!courseData.length) throw new Error("Course not found");
  const currentPrerequisites = courseData[0].prerequisites || [];
  const prerequisiteIndex = currentPrerequisites.findIndex((preString) => {
    const pre = JSON.parse(preString);
    return (
      pre.courseid === prerequisite.courseid &&
      pre.coursename === prerequisite.coursename &&
      pre.courselevel === prerequisite.courselevel
    );
  });
  if (prerequisiteIndex === -1) throw new Error("Prerequisite not found");
  const newPrerequisites = [
    ...currentPrerequisites.slice(0, prerequisiteIndex),
    ...currentPrerequisites.slice(prerequisiteIndex + 1),
  ];
  const [result] = await dbconn.execute(
    `UPDATE courses SET prerequisites = ? WHERE courseid = ?`,
    [JSON.stringify(newPrerequisites), courseId]
  );
  return { updated: result.affectedRows === 1 };
};

// Function to fetch all courses
const fetchAllCourses = async () => {
  try {
    const [rows] = await dbconn.query("SELECT * FROM courses");
    return rows;
  } catch (error) {
    console.error("Error fetching all courses", error);
    throw new Error("Error fetching all courses");
  }
};

// Function to insert a new course
const insertCourse = async (courseData) => {
  try {
    const [result] = await dbconn.execute(
      `INSERT INTO courses (courseid, coursename, courselevel, prerequisites) 
       VALUES (?, ?, ?, ?)`,
      [courseData.courseid, courseData.coursename, courseData.courselevel, "[]"]
    );
    return { success: result.affectedRows === 1 };
  } catch (error) {
    console.error("Error inserting course:", error);
    throw error;
  }
};

// Function to get specific course
const getSpecificCourse = async (courseId) => {
  const queryC = "SELECT * FROM courses WHERE courseid=?";
  try {
    const specificCourse = await dbconn.query(queryC, [courseId]);
    return specificCourse[0];
  } catch (err) {
    throw err;
  }
};

// Function to insert advising data
const insertLGC = async (studentId, lt, lgpa, ct) => {
  const lgcQ = `
    INSERT INTO advising (student_id, last_term, last_gpa, current_term, date_submitted, status) 
    VALUES (?, ?, ?, ?, CURDATE(), 'pending')`;
  try {
    await dbconn.query(lgcQ, [studentId, lt, lgpa, ct]);
    console.log("Data inserted into advising successfully");
  } catch (err) {
    console.error("Error inserting data into the table advising", err);
    throw err;
  }
};

// Function to insert prerequisites
const insertPreUsers = async (advisingRecordId, courseLevel, courseName) => {
  const preUsersQ = `
    INSERT INTO prerequisites (advising_record_id, prerequisite_level, prerequisite_name) 
    VALUES (?, ?, ?)`;
  try {
    await dbconn.query(preUsersQ, [advisingRecordId, courseLevel, courseName]);
    console.log("Data inserted into the table prerequisites successfully");
  } catch (err) {
    console.error("Error inserting data into the table prerequisites", err);
    throw err;
  }
};

// Function to insert course plan
const insertCoursePlan = async (advisingRecordId, courseLevel, courseName) => {
  const coursePlan = `
    INSERT INTO courseplan (advising_record_id, course_level, course_name) 
    VALUES (?, ?, ?)`;
  try {
    await dbconn.query(coursePlan, [advisingRecordId, courseLevel, courseName]);
    console.log("Inserted values into the course_plan successfully");
  } catch (err) {
    console.error("Error inserting the values into the course plan table", err);
    throw err;
  }
};

// Function to approve advising requests
const advisingApprover = async (status, student_id) => {
  const advisingApproverQ = `UPDATE advisingapproval SET status=? WHERE student_id=?`;
  try {
    await dbconn.query(advisingApproverQ, [status, student_id]);
    console.log("Query for approving or rejecting request completed");
  } catch (err) {
    console.error("Error in approving or rejecting the request", err);
    throw err;
  }
};

// Function to retrieve course prerequisites
const courseDataRet = async () => {
  const dataRetQ = `SELECT prerequisites FROM courses`;
  let jsonObjectarr = [];
  try {
    const dataRetd = await dbconn.query(dataRetQ);
    for (let i = 0; i < dataRetd[0].length; i++) {
      let temp = dataRetd[0][i].prerequisites;
      if (temp.length !== 0) {
        for (let k = 0; k < temp.length; k++) {
          jsonObjectarr.push(JSON.parse(temp[k]));
        }
      }
    }
    const uniqueCourses = jsonObjectarr.filter(
      (course, index, self) =>
        index === self.findIndex(
          (t) => t.courseid === course.courseid && t.coursename === course.coursename
        )
    );
    return uniqueCourses;
  } catch (err) {
    console.error("Error retrieving the data from courses", err);
    throw err;
  }
};

// Function to fetch course details
const detailfetch = async () => {
  const detailQ = `SELECT courseid, coursename, courselevel FROM courses`;
  try {
    const coursedetail = await dbconn.query(detailQ);
    return coursedetail[0];
  } catch (err) {
    console.error("Error fetching the details from the course", err);
    throw err;
  }
};

// Function to check course records
const getRecord = async (courseid, studentId) => {
  const forDuplicateQ = `SELECT * FROM course_records WHERE courseid=? AND studentid=?`;
  try {
    const resp = await dbconn.query(forDuplicateQ, [courseid, studentId]);
    return resp[0].length === 0;
  } catch (err) {
    console.error("Error fetching records from course records", err);
    throw err;
  }
};

// Function to get course for insertion
const getCourseForInsertion = async (courseid) => {
  const courseForInsertionQ = `SELECT courselevel, coursename FROM courses WHERE courseid=?`;
  try {
    const response = await dbconn.query(courseForInsertionQ, [courseid]);
    return response;
  } catch (err) {
    console.error("Error fetching data from courses", err);
    throw err;
  }
};

// Function to get advising records
const getAdvisingRecords = async () => {
  try {
    const query = `
      SELECT a.student_id, u.username AS student_name, a.status
      FROM advising a
      JOIN users u ON a.student_id = u.id`;
    const records = await dbconn.query(query);
    return records;
  } catch (error) {
    console.error("Error fetching advising records:", error);
    throw error;
  }
};

// Function to get advising record with details
const getAdvisingRecordWithDetails = async (studentId) => {
  const query = `
    SELECT 
      a.id AS advisingId, a.student_id, a.last_term, a.last_gpa, a.current_term, 
      a.date_submitted,  
      GROUP_CONCAT(DISTINCT cp.course_name ORDER BY cp.id SEPARATOR ', ') AS courseplan,
      GROUP_CONCAT(DISTINCT p.prerequisite_name ORDER BY p.prerequisite_id SEPARATOR ', ') AS prerequisites,
      a.status
    FROM advising a
    LEFT JOIN courseplan cp ON a.id = cp.advising_record_id
    LEFT JOIN prerequisites p ON a.id = p.advising_record_id
    WHERE a.student_id = ?
    GROUP BY a.id`;
  try {
    const results = await dbconn.query(query, [studentId]);
    return results[0];
  } catch (error) {
    console.error("Error fetching advising record with details:", error);
    throw error;
  }
};

// Function to update advising and insert courses
const updateAdvisingAndInsertCourses = async (advisingId, newStatus) => {
  try {
    await dbconn.query("START TRANSACTION");
    const updateQuery = `
      UPDATE advising
      SET status = ?
      WHERE id = ?`;
    await dbconn.query(updateQuery, [newStatus, advisingId]);
    const insertQuery = `
      INSERT INTO course_records (courseid, courselevel, coursename, studentid)
      SELECT 
        c.courseid,
        c.courselevel,
        c.coursename,
        a.student_id
      FROM courseplan cp
      JOIN courses c ON cp.course_name = c.coursename AND cp.course_level = c.courselevel
      JOIN advising a ON cp.advising_record_id = a.id
      WHERE cp.advising_record_id = ?`;
    await dbconn.query(insertQuery, [advisingId]);
    await dbconn.query("COMMIT");
  } catch (error) {
    await dbconn.query("ROLLBACK");
    console.error("Error in updateAdvisingAndInsertCourses:", error);
    throw error;
  }
};

// Function to update course rejection
const updatingCourseRejection = async (advisingId, newStatus) => {
  const updateQuery = `
    UPDATE advising
    SET status = ?
    WHERE id = ?`;
  try {
    await dbconn.query(updateQuery, [newStatus, advisingId]);
  } catch (err) {
    console.error("Error updating the query for rejection");
  }
};

// Function to get user advising details
const getUserAdvisingDetails = async (studentId) => {
  const query = `
    SELECT 
      a.id AS advisingId, 
      a.student_id, 
      u.username AS student_name, 
      a.last_term, 
      a.last_gpa, 
      a.current_term, 
      DATE_FORMAT(a.date_submitted, '%M %d, %Y') AS date_submitted, 
      GROUP_CONCAT(DISTINCT CONCAT(p.prerequisite_name, ' (', p.prerequisite_level, ')') ORDER BY p.prerequisite_id SEPARATOR ', ') AS prerequisites,
      GROUP_CONCAT(DISTINCT CONCAT(cp.course_name, ' (', cp.course_level, ')') ORDER BY cp.id SEPARATOR ', ') AS courseplan,
      a.status
    FROM advising a
    LEFT JOIN users u ON a.student_id = u.id
    LEFT JOIN prerequisites p ON a.id = p.advising_record_id
    LEFT JOIN courseplan cp ON a.id = cp.advising_record_id
    WHERE a.student_id = ?
    GROUP BY a.id`;
  try {
    const records = await dbconn.query(query, [studentId]);
    return records;
  } catch (error) {
    console.error("Error fetching advising details:", error);
    throw error;
  }
};

// Function to check for duplicate email
const checkDuplicateEmail = async (email) => {
  const query = "SELECT COUNT(*) AS count FROM users WHERE email = ?";
  try {
    const [results] = await dbconn.query(query, [email]);
    const isDuplicate = results[0].count > 0;
    console.log(isDuplicate ? "Duplicate email: the email already exists" : "The email is unique, inserting the email in database!");
    return isDuplicate;
  } catch (err) {
    console.error("Error querying and checking if the email exists or not", err);
    throw err;
  }
};

// Function to get all questions
const getQuestions = async () => {
  const query = `SELECT * FROM questions`;
  try {
    const resp = await dbconn.query(query);
    return resp[0];
  } catch (error) {
    console.error("Error accessing the database");
    throw error;
  }
};

// Function to insert a new question
const newQuestionInserter = async (userid, question) => {
  const query = `INSERT INTO questions (userid, questions) VALUES (?, ?)`;
  try {
    await dbconn.query(query, [userid, question]);
  } catch (error) {
    console.error("Error inserting the values into the database");
    throw error;
  }
};

// Function to get user ID by email
const getUserIdQues = async (email) => {
  const query = `SELECT id FROM users WHERE email=?`;
  try {
    const respq = await dbconn.query(query, [email]);
    return respq[0];
  } catch (error) {
    console.error("Error accessing the users table");
    throw error;
  }
};

// Function to get answers for a specific question
const getAnswersForaSpecificQues = async (quesid) => {
  const query = `SELECT a.answer, u.username FROM answers a JOIN users u ON a.userid = u.id WHERE a.questionid = ?`;
  try {
    const respA = await dbconn.query(query, [quesid]);
    return respA[0];
  } catch (error) {
    console.error("Error accessing the answers table");
    throw error;
  }
};

// Function to insert an answer
const answerInserter = async (quesid, userid, answer) => {
  const query = `INSERT INTO answers (questionid, userid, answer) VALUES (?, ?, ?)`;
  try {
    await dbconn.query(query, [quesid, userid, answer]);
  } catch (error) {
    console.error("Error inserting the values into the table answers");
    throw error;
  }
};

// Function to get username of user who asked a question
const getUserWhoAskedQues = async (quesid) => {
  const query = `SELECT u.username FROM questions q JOIN users u ON q.userid = u.id WHERE q.questionid = ?`;
  try {
    const respU = await dbconn.query(query, [quesid]);
    return respU;
  } catch (error) {
    console.error("Error accessing questions and users table");
    throw error;
  }
};

// Export all functions
module.exports = {
  insertData,
  tableCreator,
  existenceChecker,
  dbconn,
  adminInserter,
  adminChecker,
  getUserByEmail,
  userVerifyer,
  deleteReq,
  getId,
  getApprovalStatus,
  getUserById,
  tokenUpdater,
  tokenRetriever,
  tokenDeleter,
  backendAdminApprover,
  adminValidate,
  adminViewer,
  passwordUpdater,
  createCoursesTableIfNotExists,
  addPrerequisite,
  removePrerequisite,
  fetchAllCourses,
  insertCourse,
  getSpecificCourse,
  tableAdvising,
  tableprereq,
  tableCourseplan,
  insertLGC,
  insertPreUsers,
  insertCoursePlan,
  tableadvisingAdmin,
  advisingApprover,
  courseDataRet,
  detailfetch,
  tableCourseRecords,
  getRecord,
  getCourseForInsertion,
  getAdvisingRecords,
  getAdvisingRecordWithDetails,
  updateAdvisingAndInsertCourses,
  updatingCourseRejection,
  getUserAdvisingDetails,
  checkDuplicateEmail,
  createTableQuestions,
  getQuestions,
  newQuestionInserter,
  getUserIdQues,
  createTableAnswers,
  getAnswersForaSpecificQues,
  answerInserter,
  getUserWhoAskedQues,
  initializeDatabase,
};