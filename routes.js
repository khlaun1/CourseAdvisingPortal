const express = require("express");
const router = express.Router();
const db = require("./Database/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nj = require("./nodeMailerjwt");
require("dotenv").config();

// User registration route
async function tableCreatorChecker(req, res) {
  const { username, email, password, firstName, lastName } = req.body;
  const newPassword = await bcrypt.hash(password, 10);
  const admin = false;

  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  try {
    if (!regex.test(password)) {
      return res.status(500).send({ passValid: false });
    }

    const isDuplicate = await db.checkDuplicateEmail(email);
    if (isDuplicate) {
      return res.status(409).send("Duplicate Email! The email already exists, try logging in");
    }

    await db.insertData(username, email, newPassword, admin);
    res.send("Data inserted successfully!");
  } catch (error) {
    console.error("Error in route handler:", error);
    res.status(500).send("Error processing your request");
  }
}

router.post("/tableCreator-Checker", tableCreatorChecker);

// Email validation and login route
router.post("/valid-email", async (req, res) => {
  const { email, password } = req.body;
  const isAdminUser = await db.getUserByEmail(email);

  if (isAdminUser.length === 0) {
    res.status(409).send({ message: "The email is invalid, please try entering a valid email" });
  } else if (isAdminUser[0].admin) {
    const userPasswordChecker = await db.userVerifyer(email, password);
    if (userPasswordChecker.success) {
      res.json({ isAdmin: true });
    } else {
      res.status(409).send({ message: "Please enter a valid email or password" });
    }
  } else {
    const userPasswordChecker = await db.userVerifyer(email, password);
    if (userPasswordChecker.success) {
      const userRow = await db.getId(email);
      const token = nj.generateToken(userRow);
      const adminCheckerVar = await db.adminChecker(email);
      if (adminCheckerVar) {
        const approvalStatusInd = await db.getApprovalStatus(email);
        if (approvalStatusInd[0].approval) {
          await db.deleteReq(email);
          await db.tokenUpdater(token, email);
          nj.sendVerificationEmail(userRow, token);
          res.json({ message: "Verification email sent", adminApproval: true, isAdmin: false });
        } else {
          res.send({ message: "Approval Pending, please wait for admin to approve", isAdmin: false, adminApproval: false });
        }
      } else {
        await db.adminInserter(email, (err) => {
          if (err) res.status(500).send({ message: "Error querying admin inserter" });
        });
        res.send({ message: "Approval Pending, Please wait for the admin to approve", isAdmin: false });
      }
    } else {
      res.status(409).send({ message: "Please enter a valid email or password" });
    }
  }
});

// Profile retrieval route
router.get("/api/profile/:token", (req, res) => {
  const { token } = req.params;
  const secret = process.env.SECRET_KEY;

  jwt.verify(token, secret, async (err, decoded) => {
    if (err) {
      return res.status(401).send("Invalid or expired token");
    }

    const userId = decoded.userId;
    try {
      const user = await db.getUserById(userId);
      res.json(user);
    } catch (dbError) {
      res.status(500).send("Error fetching the user data");
    }
  });
});

// Email verification route
router.post("/email-verification", async (req, res) => {
  const { verifyer, emailToGo } = req.body;
  const retrievedToken = await db.tokenRetriever(emailToGo);

  if (retrievedToken[0].loginToken === verifyer) {
    res.send({ verified: true });
    await db.tokenDeleter(emailToGo);
  } else {
    res.send({ verified: false });
    await db.tokenDeleter(emailToGo);
  }
});

// Admin approval route
router.post("/backend-admin", async (req, res) => {
  const { emailToGo, userreq } = req.body;
  const adminValidation = await db.adminValidate(emailToGo);
  if (adminValidation[0].admin) {
    await db.backendAdminApprover(userreq);
    res.send({ approved: true });
  } else {
    res.send({ approved: false });
  }
});

// Admin viewer route
router.get("/backend-admin-viewer", async (req, res) => {
  const adminView = await db.adminViewer();
  res.send(adminView);
});

// Password reset route
router.post("/reset-response", async (req, res) => {
  const { emailToGo, newpassword } = req.body;
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!regex.test(newpassword)) {
    res.status(500).send({
      message: "Please enter a password with uppercase and lowercase, number, and special character.",
    });
  } else {
    const newPassword = await bcrypt.hash(newpassword, 10);
    await db.passwordUpdater(newPassword, emailToGo);
    res.send({ passUpdate: true });
  }
});

// Add course prerequisite route
router.post("/api/premodify/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const newPrerequisite = req.body;

    if (!newPrerequisite.courseid || !newPrerequisite.coursename || !newPrerequisite.courselevel) {
      return res.status(400).json({ message: "Missing prerequisite information" });
    }

    if (courseId === newPrerequisite.courseid) {
      return res.status(400).json({ message: "Prerequisite cannot be the same as the course" });
    }

    const [courseData] = await db.dbconn.query(
      `SELECT prerequisites FROM courses WHERE courseid = ?`,
      [courseId]
    );

    if (!courseData.length) throw new Error("Course not found");

    const existingPrerequisites = courseData[0].prerequisites || [];
    if (existingPrerequisites.some((pre) => 
      pre.courseid === newPrerequisite.courseid &&
      pre.coursename === newPrerequisite.coursename &&
      pre.courselevel === newPrerequisite.courselevel
    )) {
      return res.status(400).json({ message: "Prerequisite already exists" });
    }

    const [prereqCourseExists] = await db.dbconn.query(
      `SELECT 1 FROM courses WHERE courseid = ? AND coursename = ? AND courselevel = ?`,
      [newPrerequisite.courseid, newPrerequisite.coursename, newPrerequisite.courselevel]
    );

    if (!prereqCourseExists.length) {
      await db.dbconn.execute(
        `INSERT INTO courses (courseid, coursename, courselevel, prerequisites) 
         VALUES (?, ?, ?, ?)`,
        [newPrerequisite.courseid, newPrerequisite.coursename, newPrerequisite.courselevel, "[]"]
      );
    }

    const addResult = await db.addPrerequisite(courseId, newPrerequisite);

    if (addResult.updated) {
      res.status(200).json({ message: "Prerequisite added successfully" });
    } else {
      res.status(500).json({ message: "Error adding prerequisite" });
    }
  } catch (error) {
    console.error("Error adding prerequisite:", error);
    res.status(500).json({ message: "Error adding prerequisite" });
  }
});

// Delete course prerequisite route
router.delete("/api/courses/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const prerequisiteToDelete = req.body;

    const [courseData] = await db.dbconn.query(
      `SELECT prerequisites FROM courses WHERE courseid = ?`,
      [courseId]
    );
    if (!courseData.length) throw new Error("Course not found");

    const currentPrerequisites = courseData[0].prerequisites || [];
    const prerequisiteIndex = currentPrerequisites.findIndex((preString) => {
      const pre = JSON.parse(preString);
      return (
        pre.courseid === prerequisiteToDelete.courseid &&
        pre.coursename === prerequisiteToDelete.coursename &&
        pre.courselevel === prerequisiteToDelete.courselevel
      );
    });

    if (prerequisiteIndex === -1) {
      return res.status(404).json({ message: "Prerequisite not found for this course" });
    }

    const removeResult = await db.removePrerequisite(courseId, prerequisiteToDelete);

    if (removeResult.updated) {
      const updatedCourse = await db.getSpecificCourse(courseId);
      res.status(200).json(updatedCourse);
    } else {
      res.status(500).json({ message: "Error removing prerequisite" });
    }
  } catch (error) {
    console.error("Error removing prerequisite:", error);
    if (error.message === "Course not found") {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Error removing prerequisite" });
    }
  }
});

// Fetch all courses route
router.get("/api/courses", async (req, res) => {
  try {
    const courses = await db.fetchAllCourses();
    res.send(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).send({ message: "Error fetching courses" });
  }
});

// Insert new course route
router.post("/api/newcourse", async (req, res) => {
  try {
    const newCourseData = req.body;

    if (!newCourseData.courseid || !newCourseData.coursename || !newCourseData.courselevel) {
      return res.status(400).json({ message: "Missing course information" });
    }

    newCourseData.courseid = newCourseData.courseid.trim().replace(/\s+/g, " ");
    newCourseData.coursename = newCourseData.coursename.trim().replace(/\s+/g, " ");
    newCourseData.courselevel = newCourseData.coursename.trim().replace(/\s+/g, " ");

    const [existingCourse] = await db.dbconn.query(
      `SELECT 1 FROM courses WHERE courseid = ?`,
      [newCourseData.courseid]
    );

    if (existingCourse.length > 0) {
      return res.status(409).json({ message: "Course already exists" });
    }

    const insertResult = await db.insertCourse(newCourseData);

    if (insertResult.success) {
      res.status(201).json({ message: "Course added successfully" });
    } else {
      res.status(500).json({ message: "Error adding course" });
    }
  } catch (error) {
    console.error("Error adding course:", error);
    res.status(500).json({ message: "Error adding course" });
  }
});

// View advising details route
router.post("/api/view-advising", async (req, res) => {
  const { emailToGo } = req.body;
  const studentIdOld = await db.dbconn.query(`SELECT id FROM users WHERE email=?`, [emailToGo]);
  const studentId = studentIdOld[0][0].id;
  const studentData = await db.getUserAdvisingDetails(studentId);
  res.status(200).send(studentData[0]);
});

// Course advising submission route
router.post("/api/course-advising", async (req, res) => {
  const { emailToGo, lt, lgpa, ct, selectedPrereqs, selectedCourses } = req.body;
  const studentIdO = await db.dbconn.query(`SELECT id FROM users WHERE email=?`, [emailToGo]);
  const studentId = studentIdO[0][0].id;

  let ltN = lt.trim().toLowerCase();
  const regex = /^\d\.\d{2}$/;

  const specCourses = await selectedCourses.map((course) => parseInt(course));
  const specPrereqs = await selectedPrereqs.map((pre) => parseInt(pre));
  const recordsOrNotPromises = specCourses.map((courseid) => db.getRecord(courseid, studentId));
  let recordsOrNot;
  try {
    recordsOrNot = await Promise.all(recordsOrNotPromises);
  } catch (error) {
    console.error("Error in fetching records: ", error);
  }

  let contains_false = await recordsOrNot.some((record) => !record);

  if (ltN === "spring" || ltN === "summer" || ltN === "fall") {
    if (regex.test(lgpa.toString())) {
      if (contains_false) {
        res.status(400).send({
          message: "You have already taken the course, please select a different course",
        });
      } else {
        await db.insertLGC(studentId, ltN, lgpa, ct);
        for (let i = 0; i < specCourses.length; i++) {
          let tempC = await db.getCourseForInsertion(specCourses[i]);
          let tempCid = await db.dbconn.query(
            `SELECT id FROM advising WHERE student_id=?`,
            [studentId]
          );
          await db.insertCoursePlan(
            tempCid[0][tempCid[0].length - 1].id,
            tempC[0][0].courselevel,
            tempC[0][0].coursename
          );
        }
        for (let k = 0; k < specPrereqs.length; k++) {
          let temp = await db.getCourseForInsertion(specPrereqs[k]);
          let tempid = await db.dbconn.query(
            `SELECT id FROM advising WHERE student_id=?`,
            [studentId]
          );
          await db.insertPreUsers(
            tempid[0][tempid[0].length - 1].id,
            temp[0][0].courselevel,
            temp[0][0].coursename
          );
        }
        res.status(200).send({ message: "Data Inserted successfully" });
      }
    } else {
      res.status(400).send({
        message: "Invalid GPA, please enter a gpa with a single digit before '.' and 2 digits after '.'",
      });
    }
  } else {
    res.status(400).send({ message: "Please enter spring, summer, or fall" });
  }
});

// Fetch course prerequisites route
router.get("/api/course-fetcher", async (req, res) => {
  const response = await db.courseDataRet();
  res.send(response);
});

// Fetch course details route
router.get("/api/detail-fetch", async (req, res) => {
  const response = await db.detailfetch();
  res.send(response);
});

// Fetch advising records route
router.get("/api/advising-records", async (req, res) => {
  try {
    const advisingRecords = await db.getAdvisingRecords();
    res.send(advisingRecords[0]);
  } catch (error) {
    res.status(500).send({ message: "Error retrieving advising records" });
  }
});

// Fetch admin advising user records route
router.post("/api/admin-advising-user-records", async (req, res) => {
  const { student_id } = req.body;
  const responseData = await db.getAdvisingRecordWithDetails(student_id);
  res.send(responseData);
});

// Update advising status route
router.post("/api/advising/update", async (req, res) => {
  const { advisingId, studentId, newStatus, storedText } = req.body;

  const userEmail = await db.dbconn.query("SELECT email FROM users WHERE id=?", [studentId]);
  const userName = await db.dbconn.query("SELECT username FROM users WHERE id=?", [studentId]);

  if (newStatus === "approved") {
    try {
      await db.updateAdvisingAndInsertCourses(advisingId, newStatus);
      nj.sendApprovalEmail(userEmail, userName);
      res.status(200).send({ formStatus: true });
    } catch (err) {
      console.error("There was an error in transaction", err);
      res.status(500).send({ message: "Database operation could not be completed" });
    }
  } else if (newStatus === "rejected") {
    await db.updatingCourseRejection(advisingId, newStatus);
    res.status(200).send({ formStatus: false });
  }
});

// Send rejection email route
router.post("/api/rejection-email", async (req, res) => {
  const { storedText, userid } = req.body;
  const userData = await db.dbconn.query("SELECT email, username FROM users WHERE id=?", [userid]);
  if (userData[0].length > 0) {
    nj.sendRejectionEmail(userData[0][0].email, userData[0][0].username, storedText);
    res.status(200).send({ message: "Email sent successfully" });
  }
});

// Verify CAPTCHA route
router.post("/verify-captcha", async (req, res) => {
  const { captchaToken } = req.body;
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;

  try {
    const response = await fetch(verifyUrl, { method: "POST" });
    const data = await response.json();

    if (data.success) {
      res.send({ success: true, message: "Captcha verification passed" });
    } else {
      res.send({ success: false, message: "Captcha verification failed" });
    }
  } catch (error) {
    res.status(500).send({ success: false, message: "Server error during captcha verification" });
  }
});

// Security headers route
router.get("/seth", (req, res) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
});

// Forgot password email verification route
router.post("/forget-passw-email-ver", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(500).send({ message: "Please enter an email" });
  }

  const isAdminUser = await db.getUserByEmail(email);
  if (isAdminUser.length === 0) {
    res.status(500).send({ message: "User does not exist" });
  } else {
    const userRow = await db.getId(email);
    const token = nj.generateToken(userRow);
    await db.tokenUpdater(token, email);
    nj.sendVerificationEmail(userRow, token);
    res.status(200).send({ message: "Verification email sent", isAdmin: isAdminUser[0].admin });
  }
});

// Token verification route
router.post("/token-for-ver", async (req, res) => {
  const { token, email } = req.body;
  const retrievedToken = await db.tokenRetriever(email);

  if (!token) {
    return res.status(500).send({ message: "Please enter valid token", verified: false });
  }

  if (retrievedToken[0].loginToken === token) {
    res.send({ verified: true, message: "Token verification successful" });
    await db.tokenDeleter(email);
  } else {
    res.send({ verified: false, message: "Invalid token entered, please enter a valid token" });
  }
});

// Get all questions route
router.get("/questions", async (req, res) => {
  const allQuestions = await db.getQuestions();
  if (allQuestions.length === 0) {
    return res.status(409).send({ message: "The Questions list is empty" });
  }
  res.status(200).send(allQuestions);
});

// Add question route
router.post("/question-add", async (req, res) => {
  const { emailToGo, userInput } = req.body;

  try {
    const userid = await db.getUserIdQues(emailToGo);
    await db.newQuestionInserter(userid[0].id, userInput);
    res.send({ message: "Insertion successful" });
  } catch (error) {
    console.error("Error executing the db function");
    res.status(500).send({ message: "Error executing the db function" });
  }
});

// Get answers route
router.post("/answers", async (req, res) => {
  const { questionId } = req.body;
  try {
    const allAnswers = await db.getAnswersForaSpecificQues(questionId);
    if (allAnswers.length === 0) {
      res.status(500).send({ message: "There were no answers for this question" });
    } else {
      res.status(200).send(allAnswers);
    }
  } catch (error) {
    console.error("Error fetching data from answers");
    res.status(500).send({ message: "Error fetching data from answers" });
  }
});

// Get username for question route
router.post("/get-username", async (req, res) => {
  const { questionId } = req.body;
  try {
    const username = await db.getUserWhoAskedQues(questionId);
    res.status(200).send(username[0][0].username);
  } catch (error) {
    console.error("Error getting the username");
    res.status(500).send({ message: "Error getting the username" });
  }
});

// Insert answer route
router.post("/answer-insert", async (req, res) => {
  const { emailToGo, adminVal, questionId, userInput } = req.body;

  if (userInput.length === 0) {
    return res.status(500).send({ message: "No reply sent" });
  }

  const userid = await db.getUserIdQues(emailToGo);
  try {
    await db.answerInserter(questionId, userid[0].id, userInput);
    res.send({ message: "Data inserted successfully" });
  } catch (error) {
    res.status(500).send({ message: "Error getting userid or inserting the answer" });
  }
});

module.exports = { router, tableCreatorChecker };