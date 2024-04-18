const mysql = require("mysql2/promise");
const bcrpyt = require("bcrypt");

//the function below creates a connection pool
const dbconn = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Rahul@12345.p",
  database: "course_advising_portal",
});

//function for altering the columns
const columnadder = async () => {
  const alterer = "ALTER TABLE users ADD COLUMN email VARCHAR(255)";
  try {
    await dbconn.query(alterer);
    console.log("Column added or already exists");
  } catch (err) {
    console.error("Error altering the table", err);
    throw err;
  }
};

//function for creating table

const adminColumnAdder = async () => {
  const adminColumnQuery =
    "ALTER TABLE users ADD COLUMN admin boolean DEFAULT 0";
  try {
    await dbconn.query(adminColumnQuery);
    console.log("column add or already exists");
  } catch (err) {
    console.error("Error altering table to add admin column!", err);
    throw err;
  }
};

const tableCreator = async () => {
  const tableCreation =
    "CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL)";
  try {
    await dbconn.query(tableCreation);
    console.log("Table created or already exists");
  } catch (err) {
    console.error("Error creating table", err);
    throw err;
  }
};

//function to check if a table exists
const existenceChecker = async (tableName) => {
  const tableChecker =
    "SELECT count(*) as count FROM information_schema.tables WHERE table_schema='course_advising_portal' AND table_name=?";
  try {
    const [result] = await dbconn.query(tableChecker, [tableName]);
    return result[0].count > 0;
  } catch (err) {
    console.error("Error checking if table exists", err);
    throw err;
  }
};

//function for inserting data
const insertData = async (username, email, password, admin) => {
  const SignupInserter =
    "INSERT INTO users (username, email, password, admin, loginToken) VALUES (?, ?, ?, ?, NULL)";
  try {
    await dbconn.query(SignupInserter, [username, email, password, admin]);
  } catch (err) {
    console.error("Error running the insertion query", err);
    throw err;
  }
};

//will write in the callback to call the adminchecker function and check if the
//request is already there or not.
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

const approvedOrNot = async (email) => {
  const approvedOrNotQuery = "SELECT approval FROM admin WHERE userreq=?";
  const approvedOrNotResult = await dbconn.query(approvedOrNotQuery, [email]);
  return approvedOrNotResult[0];
};

const adminChecker = async (email) => {
  const adminCheckerQuery = "SELECT approval from admin where userreq=?";
  const adminResults = await dbconn.query(adminCheckerQuery, [email]);
  console.log(adminResults[0].length);
  if (adminResults[0].length > 0) {
    return true;
  } else {
    return false;
  }
};

const getUserByEmail = async (email) => {
  const query = "SELECT * FROM users WHERE email = ?";
  const results = await dbconn.query(query, [email]);
  //console.log('results', results)
  return results[0];
};

const userVerifyer = async (email, password) => {
  const user = await getUserByEmail(email);
  if (!user) {
    return { success: false, message: "User Not Found " };
  }
  //console.log(password)
  //console.log(user[0].password)
  const match = await bcrpyt.compare(password, user[0].password);
  let response = {
    success: "",
    message: "",
  };

  if (match) {
    response = {
      success: true,
      message: "password verified",
    };
  } else {
    response = {
      success: false,
      message: "incorrect password",
    };
  }
  return response;
};

const deleteReq = async (email, approval) => {
  const deleteReqQuery = "DELETE FROM admin WHERE userreq=? AND approval=TRUE";
  await dbconn.query(deleteReqQuery, [email, approval], (err) => {
    if (err) {
      console.error("Error deleting the request");
    }
  });
};

const getId = async (email) => {
  const getIdQuery = "SELECT * FROM users WHERE email=?";
  const getIdResult = await dbconn.query(getIdQuery, [email]);
  return getIdResult;
};

const getApprovalStatus = async (email) => {
  const getApprovalQuery = "SELECT approval from admin where userreq=?";
  const getApprovalResult = await dbconn.query(getApprovalQuery, [email]);
  //console.log(getApprovalResult);
  return getApprovalResult[0];
};

const getUserById = async (id) => {
  const query = "SELECT * FROM users WHERE id = ?";
  const results = await dbconn.query(query, [id]);
  //console.log('results', results)
  return results[0];
};

//to insert or rather update the token field in the users table
const tokenUpdater = async (token, email) => {
  const tokenUpdation = "UPDATE users set loginToken=? where email=?";
  try {
    await dbconn.query(tokenUpdation, [token, email]);
  } catch (err) {
    console.error("Error updating the loginToken column of the users table");
    throw err;
  }
};

const tokenRetriever = async (email) => {
  const tokenRetention = "SELECT loginToken FROM users WHERE email=?";
  try {
    const retr = await dbconn.query(tokenRetention, [email]);
    //console.log("this is my token", retr)
    return retr[0];
  } catch (err) {
    console.error("Error retrieving the token!");
    throw err;
  }
};

const tokenDeleter = async (email) => {
  const deletionQuery = "UPDATE users SET loginToken=NULL where email=?";
  try {
    await dbconn.query(deletionQuery, [email]);
  } catch (err) {
    console.error("Error setting the token null");
  }
};

const backendAdminApprover = async (email) => {
  const approverQuery = "UPDATE admin SET approval=1 WHERE userreq=?";
  try {
    await dbconn.query(approverQuery, [email]);
  } catch (err) {
    console.error("There was an error updating the approval status in admin");
    throw err;
  }
};

const adminValidate = async (email) => {
  const adminValidateQuery = "SELECT admin from users where email=?";
  try {
    const validationResult = await dbconn.query(adminValidateQuery, [email]);
    //console.log(getApprovalResult);
    return validationResult[0];
  } catch (err) {
    console.error("Admin validation failed");
    throw err;
  }
};

const adminViewer = async () => {
  const adminViewerQuery = "SELECT * FROM admin";
  try {
    const adminViewerResult = await dbconn.query(adminViewerQuery);
    //console.log(adminViewerResult[0])
    return adminViewerResult[0];
  } catch (err) {
    console.error("Error viewing the admin table");
    throw err;
  }
};

const passwordUpdater = async (password, email) => {
  const updaterQuery = "UPDATE users SET password=? WHERE email=?";
  try {
    await dbconn.query(updaterQuery, [password, email]);
  } catch (err) {
    console.error("Error updating the password");
    throw err;
  }
};

const createCoursesTableIfNotExists = async () => {
  const sql = `CREATE TABLE IF NOT EXISTS courses (
        courseid INT PRIMARY KEY, 
        coursename VARCHAR(100) NOT NULL, 
        courselevel VARCHAR(50) NOT NULL,
        prerequisites JSON 
    )`;

  try {
    await dbconn.query(sql);
  } catch (error) {
    console.error(
      "The table already exists or there was an error creating table.",
      error
    );
  }
};

const addPrerequisite = async (courseId, prerequisite) => {
  // 1. Verify prerequisite course exists
  const [prereqExists] = await dbconn.query(
    `SELECT 1 FROM courses WHERE courseid = ? AND coursename = ? AND courselevel = ?`,
    [prerequisite.courseid, prerequisite.coursename, prerequisite.courselevel]
  );

  if (!prereqExists.length) {
    throw new Error("Prerequisite course does not exist");
  }

  // Convert prerequisite object to JSON string
  const prerequisiteJSON = JSON.stringify(prerequisite);

  // 2. Update prerequisites
  const [result] = await dbconn.execute(
    `UPDATE courses SET prerequisites = JSON_ARRAY_APPEND(prerequisites, '$', ?) WHERE courseid = ?`,
    [prerequisiteJSON, courseId] // Make sure to pass prerequisiteJSON here
  );

  return { updated: result.affectedRows === 1 };
};

const removePrerequisite = async (courseId, prerequisite) => {
  // 1. Verify Prerequisite Exists in Array
  const [courseData] = await dbconn.query(
    `SELECT prerequisites FROM courses WHERE courseid = ?`,
    [courseId]
  );

  if (!courseData.length) throw new Error("Course not found"); // Course itself doesn't exist

  const currentPrerequisites = courseData[0].prerequisites || [];
  const prerequisiteIndex = currentPrerequisites.findIndex((preString) => {
    const pre = JSON.parse(preString);
    return (
      pre.courseid === prerequisite.courseid &&
      pre.coursename === prerequisite.coursename &&
      pre.courselevel === prerequisite.courselevel
    );
  });
  /*
  const prerequisiteIndex = currentPrerequisites.findIndex(
    (pre) =>
      pre.courseid === prerequisite.courseid &&
      pre.coursename === prerequisite.coursename &&
      pre.courselevel === prerequisite.courselevel
  );*/

  if (prerequisiteIndex === -1) throw new Error("Prerequisite not found");

  // 2. Remove the prerequisite
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

const fetchAllCourses = async () => {
  try {
    const [rows] = await dbconn.query("SELECT * FROM courses");
    /*
        const courses = rows.map(course => {
            return {
                ...course,
                prerequisites: course.prerequisites ? JSON.parse(course.prerequisites) : []
            };
        });*/
    return rows;
  } catch (error) {
    console.error("This is the error", error);
    throw new Error("Error fetching all courses"); // Handle the error gracefully
  }
};

const insertCourse = async (courseData) => {
  try {
    const [result] = await dbconn.execute(
      `INSERT INTO courses (courseid, coursename, courselevel, prerequisites) 
             VALUES (?, ?, ?, ?)`,
      [courseData.courseid, courseData.coursename, courseData.courselevel, "[]"]
    ); // Assuming you have 'dbconn' object for database connection
    return { success: result.affectedRows === 1 };
  } catch (error) {
    console.error("Error inserting course:", error);
    throw error; // Re-throw for the route handler to catch
  }
};

const getSpecificCourse = async (courseId) => {
  const queryC = "select * from courses where courseid=?";
  try {
    const specificCourse = await dbconn.query(queryC, [courseId]);
    console.log(specificCourse[0]);
    return specificCourse[0];
  } catch (err) {
    throw err;
  }
};

//query function to create table advising
const tableAdvising = async () => {
  const advisingQ = `CREATE TABLE IF NOT EXISTS advising (
        id INT PRIMARY KEY AUTO_INCREMENT,  
        student_id INT NOT NULL,  
        last_term VARCHAR(255),  
        last_gpa DECIMAL(3,2), 
        current_term VARCHAR(255),
        date_submitted DATE,  
        status ENUM('approved', 'rejected', 'pending') DEFAULT 'pending',   
        FOREIGN KEY (student_id) REFERENCES users(id)
    );`;
  try {
    await dbconn.query(advisingQ);
    console.log("Table created successfully");
  } catch (err) {
    console.error("There was a problem creating the table advising", err);
    throw err;
  }
};

//query function to create table prerequisites
const tableprereq = async () => {
  const prereqQ = `CREATE TABLE IF NOT EXISTS prerequisites (
        prerequisite_id INT PRIMARY KEY AUTO_INCREMENT,
        prerequisite_level VARCHAR(255) NOT NULL,
        prerequisite_name VARCHAR(255) NOT NULL,
        advising_record_id INT NOT NULL, 
        FOREIGN KEY (advising_record_id) REFERENCES advising(id)
    );`;
  try {
    await dbconn.query(prereqQ);
    console.log("table prerequisites was created successfully");
  } catch (err) {
    console.error("there was a problem creating table prerequisites", err);
    throw err;
  }
};

//query function to create table courseplan
const tableCourseplan = async () => {
  const courseplanQ = `CREATE TABLE IF NOT EXISTS courseplan (
        id INT PRIMARY KEY AUTO_INCREMENT,
        course_level VARCHAR(255) NOT NULL,
        course_name VARCHAR(255) NOT NULL,
        advising_record_id INT NOT NULL, 
        FOREIGN KEY (advising_record_id) REFERENCES advising(id)
    );`;
  try {
    await dbconn.query(courseplanQ);
    console.log("table courseplan was created successfully");
  } catch (err) {
    console.error("there was an error creating the table courseplan", err);
    throw err;
  }
};

//query function to store course records for students/users.
const tableCourseRecords = async () => {
  const courseRecordsQ = `CREATE TABLE IF NOT EXISTS course_records (
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
  } catch (err) {
    console.error("There was an error creating the table course_records", err);
    throw err;
  }
};

//query for head section last term, last gpa, current term date submitted
const insertLGC = async (studentId, lt, lgpa, ct) => {
  const lgcQ = `INSERT INTO advising(
        student_id, last_term, last_gpa, current_term, date_submitted, status 
    ) VALUES (
        ?, ?, ?, ?, CURDATE(), 'pending'
    )`;
  try {
    await dbconn.query(lgcQ, [studentId, lt, lgpa, ct]);
    console.log("data inserted into advising successfully");
  } catch (err) {
    console.error(
      "There was an error inserting data into the table advising",
      err
    );
    throw err;
  }
};

//query function to insert values into table prerequisites
const insertPreUsers = async (advisingRecordId, courseLevel, courseName) => {
  const preUsersQ = `INSERT INTO prerequisites(
        advising_record_id, prerequisite_level, prerequisite_name) VALUES (
            ?, ?, ?)`;
  try {
    await dbconn.query(preUsersQ, [advisingRecordId, courseLevel, courseName]);
    console.log("data inserted into the table prerequisites successfullly");
  } catch (err) {
    console.error(
      "There was an error inserting data into the table prerequisites",
      err
    );
    throw err;
  }
};

//function to insert values into table courseplan
const insertCoursePlan = async (advisingRecordId, courseLevel, courseName) => {
  const coursePlan = `INSERT INTO courseplan(
        advising_record_id, course_level, course_name
    ) VALUES (
        ?, ?, ?
    )`;
  try {
    await dbconn.query(coursePlan, [advisingRecordId, courseLevel, courseName]);
    console.log("Inserted values into the course_plan successfully");
  } catch (err) {
    console.error(
      "there was an error inserting the values into the course plan table",
      err
    );
    throw err;
  }
};

//query function for admin approval table for advising requests.
const tableadvisingAdmin = async () => {
  const advisingAdminQ = `CREATE TABLE IF NOT EXISTS advisingapproval (
    student_id INT PRIMARY KEY NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    status VARCHAR(255) DEFAULT 'pending' NOT NULL,
    FOREIGN KEY (student_id) REFERENCES users(id)
  )`;
  try {
    await dbconn.query(advisingAdminQ);
    console.log("table advisingapproval created successfully ");
  } catch (err) {
    console.error(
      "There was an error creating the table advisingapproval",
      err
    );
    throw err;
  }
};

//function for approving student advising requests
const advisingApprover = async (status, student_id) => {
  const advisingApproverQ = `UPDATE advisingapproval set status=? where student_id=?`;
  //const advisingApproverQR = `UPDATE advisingapproval set status='rejected' where student_id=?`;
  try {
    await dbconn.query(advisingApproverQ, [status, student_id]);
    console.log("query for approving or rejecting request completed");
  } catch (err) {
    console.error(
      "There was an error in approving or rejecting the request",
      err
    );
    throw err;
  }
};

//function to retrieve course id and name
const courseDataRet = async () => {
  const dataRetQ = `select prerequisites from courses`;
  let jsonObjectarr = [];
  try {
    const dataRetd = await dbconn.query(dataRetQ); //this has array of objects with prerequisites column
    //console.log(dataRetd[0]);
    for (let i = 0; i < dataRetd[0].length; i++) {
      //console.log(temp);
      let temp = dataRetd[0][i].prerequisites;
      if (temp.length !== 0) {
        //console.log(temp);
        for (let k = 0; k < temp.length; k++) {
          jsonObjectarr.push(JSON.parse(temp[k]));
        }
      }
    }
    //console.log(jsonObjectarr);
    const uniqueCourses = jsonObjectarr.filter(
      (course, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.courseid === course.courseid && t.coursename === course.coursename
        )
    );

    return uniqueCourses;
  } catch (err) {
    console.error("there was an error retrieving the data from courses", err);
    throw err;
  }
};

//function for retrieving course details for course plan section
const detailfetch = async () => {
  const detailQ = `Select courseid, coursename,courselevel from courses`;
  try {
    const coursedetail = await dbconn.query(detailQ);
    //console.log(coursedetail);
    return coursedetail[0];
  } catch (err) {
    console.error(
      "There was an error fetching the details from the course",
      err
    );
    throw err;
  }
};

const getRecord = async (courseid, studentId) => {
  const forDuplicateQ = `SELECT * from course_records where courseid=? and studentid=?`;
  try {
    const resp = await dbconn.query(forDuplicateQ, [courseid, studentId]);
    console.log("This is resp", resp);
    if (resp[0].length > 0) {
      return false;
    } else {
      return true;
    }
  } catch (err) {
    console.error(
      "There was an error fetching records from course records",
      err
    );
    throw err;
  }
};

const getCourseForInsertion = async (courseid) => {
  const courseForInsertionQ = `SELECT courselevel, coursename from courses where courseid=?`;
  try {
    const response = await dbconn.query(courseForInsertionQ, [courseid]);
    return response;
  } catch (err) {
    console.error("There was an error fetching data from courses", err);
    throw err;
  }
};

const getAdvisingRecords = async () => {
  try {
    const query = `
        SELECT a.student_id, u.username AS student_name, a.status
        FROM advising a
        JOIN users u ON a.student_id = u.id
      `;
    const records = await dbconn.query(query);
    //console.log(records);
    return records;
  } catch (error) {
    console.error("Error fetching advising records:", error);
    throw error;
  }
};

const getAdvisingRecordWithDetails = async (studentId) => {
  const query = `
    SELECT 
      a.id as advisingId, a.student_id, a.last_term, a.last_gpa, a.current_term, 
      a.date_submitted,  
      GROUP_CONCAT(DISTINCT cp.course_name ORDER BY cp.id SEPARATOR ', ') as courseplan,
      GROUP_CONCAT(DISTINCT p.prerequisite_name ORDER BY p.prerequisite_id SEPARATOR ', ') as prerequisites,
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

const updateAdvisingAndInsertCourses = async (advisingId, newStatus) => {
  try {
    // Begin a transaction
    await dbconn.query("START TRANSACTION");

    // Update the status in the advising table
    const updateQuery = `
        UPDATE advising
        SET status = ?
        WHERE id = ?
      `;
    await dbconn.query(updateQuery, [newStatus, advisingId]);

    // Insert related courses from the courseplan table into the course_records table
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
        WHERE cp.advising_record_id = ?
      `;
    await dbconn.query(insertQuery, [advisingId]);

    // Commit the transaction
    await dbconn.query("COMMIT");
  } catch (error) {
    await dbconn.query("ROLLBACK");
    console.error("Error in updateAdvisingAndInsertCourses:", error);
    throw error;
  }
};

const updatingCourseRejection = async (advisingId, newStatus) => {
  const updateQuery = `
    UPDATE advising
    SET status = ?
    WHERE id = ?
  `;
  try {
    await dbconn.query(updateQuery, [newStatus, advisingId]);
  } catch (err) {
    consoler.error("There was an error updating the query for rejection");
  }
};

const getUserAdvisingDetails = async (studentId) => {
  const query = `
        SELECT 
            a.id as advisingId, 
            a.student_id, 
            u.username as student_name, 
            a.last_term, 
            a.last_gpa, 
            a.current_term, 
            DATE_FORMAT(a.date_submitted, '%M %d, %Y') as date_submitted, 
            GROUP_CONCAT(DISTINCT CONCAT(p.prerequisite_name, ' (', p.prerequisite_level, ')') ORDER BY p.prerequisite_id SEPARATOR ', ') as prerequisites,
            GROUP_CONCAT(DISTINCT CONCAT(cp.course_name, ' (', cp.course_level, ')') ORDER BY cp.id SEPARATOR ', ') as courseplan,
            a.status
        FROM advising a
        LEFT JOIN users u ON a.student_id = u.id
        LEFT JOIN prerequisites p ON a.id = p.advising_record_id
        LEFT JOIN courseplan cp ON a.id = cp.advising_record_id
        WHERE a.student_id = ?
        GROUP BY a.id
    `;

  try {
    const records = await dbconn.query(query, [studentId]);
    return records;
  } catch (error) {
    console.error("Error fetching advising details:", error);
    throw error;
  }
};

const checkDuplicateEmail = async (email) => {
  const query = "SELECT COUNT(*) AS count FROM users WHERE email = ?";
  try {
    const [results] = await dbconn.query(query, [email]);
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

const createTableQuestions = async () => {
  const query = `CREATE TABLE questions (
    questionid INT NOT NULL AUTO_INCREMENT,
    userid INT NOT NULL,
    questions VARCHAR(255) NOT NULL,
    PRIMARY KEY (questionid),
    FOREIGN KEY (userid) REFERENCES users(id)
  )`;
};

const getQuestions = async () => {
  const query = `SELECT * FROM questions`;
  try {
    const resp = await dbconn.query(query);
    return resp[0];
  } catch (error) {
    console.error("there was an error accessing the database");
    throw err;
  }
};

const newQuestionInserter = async (userid, question) => {
  const query = `INSERT into questions(userid, questions) VALUES(?, ?)`;
  try {
    await dbconn.query(query, [userid, question]);
  } catch (error) {
    console.error("There was an error inserting the values into the database");
    throw err;
  }
};

const getUserIdQues = async (email) => {
  const query = `SELECT id from users where email=?`;
  try {
    const respq = await dbconn.query(query, [email]);
    return respq[0];
  } catch (error) {
    console.error("There was an error accessing the users table");
    throw err;
  }
};

const createTableAnswers = async () => {
  query = `create table answers (
    answerid int auto_increment,
    questionid int not null,
    userid int not null,
    answer varchar(255) not null,
    primary key(answerid),
    foreign key (questionid) references questions(questionid),
    foreign key (userid) references users(id)
  )`;
};

const getAnswersForaSpecificQues = async (quesid) => {
  const query = `SELECT a.answer, u.username FROM answers a JOIN users u ON a.userid = u.id WHERE a.questionid = ?;`;
  try {
    const respA = await dbconn.query(query, [quesid]);
    return respA[0];
  } catch (error) {
    console.error("there was an error accessing the answers table");
    throw err;
  }
};

//query function for inserting into the table answers
const answerInserter = async (quesid, userid, answer) => {
  const query = `insert into answers(questionid, userid, answer) values (?, ?, ?)`;
  try {
    await dbconn.query(query, [quesid, userid, answer]);
  } catch (error) {
    console.error(
      "there was an error inserting the values into the table answers"
    );
    throw err;
  }
};

const getUserWhoAskedQues = async (quesid) => {
  const query = `SELECT u.username FROM questions q JOIN users u ON q.userid = u.id WHERE q.questionid = ?;`;
  try {
    const respU = dbconn.query(query, [quesid]);
    return respU;
  } catch (error) {
    console.error("There was an error accessing questions and users table");
    throw err;
  }
};

//get quesid from

//exporting the functions
module.exports = {
  insertData,
  tableCreator,
  columnadder,
  existenceChecker,
  dbconn,
  adminInserter,
  adminChecker,
  getUserByEmail,
  userVerifyer,
  approvedOrNot,
  deleteReq,
  getId,
  getApprovalStatus,
  adminColumnAdder,
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
};
