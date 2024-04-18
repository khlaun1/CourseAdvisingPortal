const admincred = require("./admincred");
const express = require("express");
const router = express.Router();
const db = require("./Database/db");
//const checkDuplicateEmail = require("./Database/duplicateChecker");

const bcrypt = require("bcrypt");
//const validEmail = require('./Database/validLogin')
const nj = require("./nodeMailerjwt");
require("dotenv").config();

//const ser = require("./server");

/*
router.post("/api/creatingtables", async (req, res) => {
  await db.tableCreator();
  await db.createCoursesTableIfNotExists();
  await db.tableAdvising();
  await db.tableprereq();
  await db.tableCourseplan();
  await db.tableCourseRecords();
  
  
});*/

/*
router.post("/tableCreator-Checker", async (req, res) => {
  const { id, username, email, password, firstName, lastName } = req.body;
  const newPassword = await bcrypt.hash(password, 10);
  const admin = false;

  try {
    // Attempt to create the table
    await db.tableCreator();
    await db.createCoursesTableIfNotExists();

    // Check if the 'users' table exists
    const exists = await db.existenceChecker("users");
    if (!exists) {
      return res.status(500).send("Error: Table does not exist");
    }

    // Check for duplicate email
    const isDuplicate = await checkDuplicateEmail(email);
    console.log(isDuplicate);
    if (isDuplicate) {
      return res
        .status(409)
        .send("Duplicate Email! The email already exists, try logging in");
    }

    // Insert the data into the table
    await db.insertData(id, username, email, newPassword, admin);
    res.send("Data inserted successfully!");
  } catch (error) {
    console.error("Error in route handler:", error);
    res.status(500).send("Error processing your request");
  }
});*/

async function tableCreatorChecker(req, res) {
  const { username, email, password, firstName, lastName } = req.body;
  const newPassword = await bcrypt.hash(password, 10);
  const admin = false;

  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  try {
    // Attempt to create the table
    //await db.tableCreator();
    //await db.createCoursesTableIfNotExists();

    // Check if the 'users' table exists
    //const exists = await db.existenceChecker("users");
    //if (!exists) {
    //return res.status(500).send("Error: Table does not exist");
    //}

    if (!regex.test(password)) {
      return res.status(500).send({ passValid: false });
    } else {
      const isDuplicate = await db.checkDuplicateEmail(email);
      //console.log(isDuplicate);
      if (isDuplicate) {
        return res
          .status(409)
          .send("Duplicate Email! The email already exists, try logging in");
      }

      await db.insertData(username, email, newPassword, admin);
      res.send("Data inserted successfully!");
    }
  } catch (error) {
    console.error("Error in route handler:", error);
    res.status(500).send("Error processing your request");
  }
}

router.post("/tableCreator-Checker", tableCreatorChecker);

router.post("/valid-email", async (req, res) => {
  const { email, password } = req.body;

  //console.log("Received email:", email);
  //console.log("Received password:", password);
  //console.log("Admin email:", admincred.email);
  //console.log("Admin password:", admincred.password);

  const isAdminUser = await db.getUserByEmail(email);
  //console.log(isAdminUser)
  if (isAdminUser.length === 0) {
    res.status(409).send({
      messsage: "The email is invalid please try entering a valid email",
    });
  } else if (isAdminUser[0].admin) {
    await db.createCoursesTableIfNotExists();
    const userPasswordChecker = await db.userVerifyer(email, password);
    console.log(
      "This is for chekcing if passwordchecker succeeded",
      userPasswordChecker
    );
    if (userPasswordChecker.success) {
      res.json({ isAdmin: true });
    } else {
      res
        .status(409)
        .send({ message: "Please enter a valid email or password" });
    }
  } else {
    //console.log(email, password)
    //console.log(await db.getUserByEmail(email));
    const userPasswordChecker = await db.userVerifyer(email, password);
    //console.log(userPasswordChecker);
    if (userPasswordChecker.success) {
      /*
            await db.adminInserter(email, (err)=>{
                if(err){
                    res.status(500).send('Error querying admin inserter');
                }
            })*/
      //have to add here one more check which will check if the email entered is
      //of admin or not.
      const userRow = await db.getId(email);
      //console.log(userRow);
      const token = nj.generateToken(userRow);
      //console.log(token);

      //console.log('I am here ');
      const adminCheckerVar = await db.adminChecker(email);
      //console.log(adminCheckerVar)

      //checking if there is any request or not in the admin table
      if (adminCheckerVar) {
        //console.log(adminCheckerVar)
        const approvalStatusInd = await db.getApprovalStatus(email);
        if (approvalStatusInd[0].approval) {
          await db.createCoursesTableIfNotExists();
          await db.deleteReq(email);
          await db.tokenUpdater(token, email);
          nj.sendVerificationEmail(userRow, token);
          res.json({
            message: "Verification email sent",
            adminApproval: true,
            isAdmin: false,
          });
        } else if (!approvalStatusInd[0].approval) {
          res.send({
            message: "Approval Pending please wait for admin to approve",
            isAdmin: false,
            adminApproval: false,
          });
        }
      }
      //In case there is no request found with that particular email
      else if (!adminCheckerVar) {
        //console.log(adminCheckerVar)
        await db.adminInserter(email, (err) => {
          if (err) {
            res.status(500).send({ message: "Error querying admin inserter" });
          }
        });
        res.send({
          messsage: "Approval Pending, Please wait for the admin to approve",
          isAdmin: false,
        });
      }
    }
  }
});

router.get("/api/profile/:token", (req, res) => {
  const { token } = req.params;
  const secret = process.env.SECRET_KEY;

  jwt.verify(token, secret, async (err, decoded) => {
    if (err) {
      return res.status(401).send("Invalid or expired token");
    }

    const userId = decoded.userId;
    console.log(userId);
    try {
      const user = await db.getUserById(userId);
      res.json(user);
    } catch (dbError) {
      res.status(500).send("error fetching the user data");
    }

    res.send("Account verified successfully");
  });
});

//route handler for http request from the verification page

router.post("/email-verification", async (req, res) => {
  const { verifyer, emailToGo } = req.body;
  const salt = process.env.SECRET_KEY;

  const retrievedToken = await db.tokenRetriever(emailToGo);

  //console.log('This is my email', emailToGo)
  //console.log('This is my verifyer', verifyer);
  //console.log('This is my retrievedTOken', retrievedToken[0].loginToken)

  //here I am checking if the token which came with the http request is equal to the token which was stored in the users table
  if (retrievedToken[0].loginToken === verifyer) {
    res.send({ verified: true });
    await db.tokenDeleter(emailToGo);
  } else {
    res.send({ verified: false });
    await db.tokenDeleter(emailToGo);
  }
});

router.post("/backend-admin", async (req, res) => {
  const { emailToGo, userreq } = req.body;
  //removed password from the req above

  //const userVerified = await db.userVerifyer(email, password);
  //if(userVerified.success){
  const adminValidation = await db.adminValidate(emailToGo);
  if (adminValidation[0].admin) {
    await db.backendAdminApprover(userreq);
    res.send({ approved: true });
  } else if (!adminValidation[0].admin) {
    res.send({ approved: false });
  }
  //}
  // else{
  //     res.send({message:'Non admin users are not allowed to approve requests'});
  // }
});

router.get("/backend-admin-viewer", async (req, res) => {
  const adminView = await db.adminViewer();
  console.log(adminView);
  res.send(adminView);
});

router.post("/reset-response", async (req, res) => {
  const { emailToGo, newpassword } = req.body;
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!regex.test(newpassword)) {
    res.status(500).send({
      message:
        "Please enter a password with with uppercase and lowercase, number and special.",
    });
  } else {
    const newPassword = await bcrypt.hash(newpassword, 10);
    await db.passwordUpdater(newPassword, emailToGo);

    res.send({ passUpdate: true });
  }
});

//route handler for adding course prereq
router.post("/api/premodify/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const newPrerequisite = req.body;
    console.log(newPrerequisite);

    if (
      !newPrerequisite.courseid ||
      !newPrerequisite.coursename ||
      !newPrerequisite.courselevel
    ) {
      return res
        .status(400)
        .json({ message: "Missing prerequisite information" });
    }

    if (courseId === newPrerequisite.courseid) {
      return res
        .status(400)
        .json({ message: "Prerequisite cannot be the same as the course" });
    }

    const [courseData] = await db.dbconn.query(
      `SELECT prerequisites FROM courses WHERE courseid = ?`,
      [courseId]
    );

    if (!courseData.length) throw new Error("Course not found A");

    const existingPrerequisites = courseData[0].prerequisites || [];
    if (
      existingPrerequisites.some(
        (pre) =>
          pre.courseid === newPrerequisite.courseid &&
          pre.coursename === newPrerequisite.coursename &&
          pre.courselevel === newPrerequisite.courselevel
      )
    ) {
      return res.status(400).json({ message: "Prerequisite already exists" });
    }

    const [prereqCourseExists] = await db.dbconn.query(
      `SELECT 1 FROM courses WHERE courseid = ? AND coursename = ? AND courselevel = ?`,
      [
        newPrerequisite.courseid,
        newPrerequisite.coursename,
        newPrerequisite.courselevel,
      ]
    );

    if (!prereqCourseExists.length) {
      await db.dbconn.execute(
        `INSERT INTO courses (courseid, coursename, courselevel, prerequisites) 
                 VALUES (?, ?, ?, ?)`,
        [
          newPrerequisite.courseid,
          newPrerequisite.coursename,
          newPrerequisite.courselevel,
          "[]",
        ]
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

//route handler for deleting course prereq
router.delete("/api/courses/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId; //storing the course id from params
    //console.log(courseId);
    const prerequisiteToDelete = req.body; //knowing which prerequisite to delete
    //console.log(prerequisiteToDelete);

    const [courseData] = await db.dbconn.query(
      `SELECT prerequisites FROM courses WHERE courseid = ?`,
      [courseId]
    ); //which course data or which course prerequisite has to be deleting storing all it values in courseData
    //console.log(courseData);
    if (!courseData.length) throw new Error("Course not found");

    const currentPrerequisites = courseData[0].prerequisites || []; //getting just the prerequisites column
    console.log(currentPrerequisites);

    const prerequisiteIndex = currentPrerequisites.findIndex((preString) => {
      const pre = JSON.parse(preString);
      return (
        pre.courseid === prerequisiteToDelete.courseid &&
        pre.coursename === prerequisiteToDelete.coursename &&
        pre.courselevel === prerequisiteToDelete.courselevel
      );
    });

    /*
    const prerequisiteIndex = currentPrerequisites.findIndex(
      (pre) =>
        pre.courseid === prerequisiteToDelete.courseid &&
        pre.coursename === prerequisiteToDelete.coursename &&
        pre.courselevel === prerequisiteToDelete.courselevel
    );

    */

    console.log(prerequisiteIndex);

    if (prerequisiteIndex === -1) {
      return res
        .status(404)
        .json({ message: "Prerequisite not found for this course" });
    }

    const removeResult = await db.removePrerequisite(
      courseId,
      prerequisiteToDelete
    );

    if (removeResult.updated) {
      const updatedCourse = await db.getSpecificCourse(courseId);
      res.status(200).json(updatedCourse);
    } else {
      res.status(500).json({ message: "Error removing prerequisite" }); // Unexpected Error
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

//routehandler for fetch request to view courses in the webapp
router.get("/api/courses", async (req, res) => {
  try {
    //await db.createCoursesTableIfNotExists();
    const courses = await db.fetchAllCourses();
    res.send(courses);
  } catch (error) {
    //await db.createCoursesTableIfNotExists();
    console.error("Error fetching courses:", error);
    res.status(500).send({ message: "Error fetching courses" });
  }
});

//handling the insertion of a new course.

router.post("/api/newcourse", async (req, res) => {
  try {
    const newCourseData = req.body;

    if (
      !newCourseData.courseid ||
      !newCourseData.coursename ||
      !newCourseData.courselevel
    ) {
      return res.status(400).json({ message: "Missing course information" });
    }

    newCourseData.courseid = newCourseData.courseid.trim().replace(/\s+/g, " ");
    newCourseData.coursename = newCourseData.coursename
      .trim()
      .replace(/\s+/g, " ");
    newCourseData.courselevel = newCourseData.courselevel
      .trim()
      .replace(/\s+/g, " ");

    const [existingCourse] = await db.dbconn.execute(
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

//for handling displaying the course advising form
router.post("/api/view-advising", async (req, res) => {
  const { emailToGo } = req.body;

  const studentIdOld = await db.dbconn.query(
    `SELECT id from users WHERE email=?`,
    [emailToGo]
  );
  const studentId = studentIdOld[0][0].id;
  const studentData = await db.getUserAdvisingDetails(studentId);
  res.status(200).send(studentData[0]);
});

//handler for fetching courses from the table courses

//for handling after submission of the course advising form
router.post("/api/course-advising", async (req, res) => {
  //coursename, courselevel, courseid will come
  //from the request body which will be retrieved from the courses in frontend

  const { emailToGo, lt, lgpa, ct, selectedPrereqs, selectedCourses } =
    req.body;
  const studentIdO = await db.dbconn.query(
    `SELECT id from users WHERE email=?`,
    [emailToGo]
  );
  const studentId = studentIdO[0][0].id;

  //Processing the data
  let ltN = lt.trim();
  ltN = ltN.toLowerCase();
  const regex = /^\d\.\d{2}$/;

  const specCourses = await selectedCourses.map((course) => parseInt(course)); //gives an array of courseids in int form
  const specPrereqs = await selectedPrereqs.map((pre) => parseInt(pre)); //give an array of prerequisite ids
  console.log("This is the super duper special array of number", specCourses);
  const recordsOrNotPromises = specCourses.map((courseid) =>
    db.getRecord(courseid, studentId)
  );
  let recordsOrNot;
  try {
    recordsOrNot = await Promise.all(recordsOrNotPromises);
  } catch (error) {
    console.error("Error in fetching records: ", error);
  }
  console.log("This is an array of true or false", recordsOrNot);
  //console.log(specCourses);
  //console.log(specPrereqs);

  //I will invalidate the complete form and not add any values to the record
  let contains_false = await recordsOrNot.some((record) => !record);
  console.log(contains_false);

  //console.log("This is the student id: ", studentId);
  console.log("This is contains_false ", contains_false);

  //if (studentId.length > 0) {
  //await db.insertLGC(studentId, lt, lgpa, ct);
  if (
    lt === "spring" ||
    lt === "summer" ||
    (lt === "fall" && ct === "spring") ||
    ct === "summer" ||
    ct === "fall"
  ) {
    if (regex.test(lgpa.toString())) {
      if (contains_false) {
        res.status(400).send({
          message:
            "You have already taken the course, please select a different course",
        });
      } else {
        await db.insertLGC(studentId, ltN, lgpa, ct);
        for (let i = 0; i < specCourses.length; i++) {
          let tempC = await db.getCourseForInsertion(specCourses[i]);
          let tempCid = await db.dbconn.query(
            `select id from advising where student_id=?`,
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
            `select id from advising where student_id=?`,
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
        message:
          "invalid GPA, please enter a gpa with a single digit before '.' and 2 digits after '.' ",
      });
    }
  } else {
    res.status(400).send({ message: "Please enter spring, summer or fall" });
  }
  /*} else {
    res.status(400).send({ message: "user does not exist" });
  }*/

  //now I need coursename and course level to insert values into prerequisite table
});

//handler which handles data retrieval for prerequisite section in the advising form
router.get("/api/course-fetcher", async (req, res) => {
  const response = await db.courseDataRet();
  res.send(response);
});

//route for handling course plan section in advising.
router.get("/api/detail-fetch", async (req, res) => {
  const response = await db.detailfetch();
  res.send(response);
});

router.get("/api/advising-records", async (req, res) => {
  try {
    const advisingRecords = await db.getAdvisingRecords();
    //console.log(advisingRecords);
    res.send(advisingRecords[0]);
  } catch (error) {
    res.status(500).send({ message: "Error retrieving advising records" });
  }
});

router.post("/api/admin-advising-user-records", async (req, res) => {
  const { student_id } = req.body;
  const responseData = await db.getAdvisingRecordWithDetails(student_id);
  res.send(responseData);
  //console.log(student_id);
});

router.post("/api/advising/update", async (req, res) => {
  const { advisingId, studentId, newStatus, storedText } = req.body;

  const userEmail = await db.dbconn.query(
    "select email from users where id=?",
    [studentId]
  );
  //console.log(userEmail);
  const userName = await db.dbconn.query(
    "select username from users where id=?",
    [studentId]
  );
  //console.log(userName);

  if (newStatus === "approved") {
    try {
      await db.updateAdvisingAndInsertCourses(advisingId, newStatus);
      nj.sendApprovalEmail(userEmail, userName);
      res.status(200).send({ formStatus: true });
    } catch (err) {
      console.error("There was an error in transaction", err);
      res
        .status(500)
        .send({ message: "database operation could not be completed" });
    }
  } else if (newStatus === "rejected") {
    await db.updatingCourseRejection(advisingId, newStatus);
    //nj.sendRejectionEmail(userEmail, userName, storedText);
    res.status(200).send({ formStatus: false });
  }
});

router.post("/api/rejection-email", async (req, res) => {
  const { storedText, userid } = req.body;
  const userData = await db.dbconn.query(
    "select email, username  from users where id=?",
    [userid]
  );
  if (userData[0].length > 0) {
    console.log("This is your userData", userData);
    nj.sendRejectionEmail(
      userData[0][0].email,
      userData[0][0].username,
      storedText
    );
    res.status(200).send({ message: "email sent successfully" });
  }
});

router.post("/verify-captcha", async (req, res) => {
  const { captchaToken } = req.body;
  const responseKey = captchaToken;
  const secretKey = "6LdOGbopAAAAAK7VPW-XqWR1-y-RCoFEEikk7jwZ";
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${responseKey}`;
  console.log(secretKey);
  console.log(responseKey);

  try {
    const response = await fetch(verifyUrl, {
      method: "POST",
    });
    console.log("This is the response", response);
    const data = await response.json();
    console.log("This is the data ", data);

    if (data.success) {
      res.send({ success: true, message: "Captcha verification passed" });
    } else {
      res.send({ success: false, message: "Captcha verification failed" });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Server error during captcha verification",
    });
  }
});

router.get("/seth", (req, res) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
});

router.post("/forget-passw-email-ver", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(500).send({ message: "please enter an email" });
  } else {
    const isAdminUser = await db.getUserByEmail(email);
    if (isAdminUser.length === 0) {
      res.status(500).send({ message: "User does not exist" });
    } else {
      const userRow = await db.getId(email);
      const token = nj.generateToken(userRow);
      await db.tokenUpdater(token, email);
      nj.sendVerificationEmail(userRow, token);
      res.status(200).send({
        message: "Verification email sent",
        isAdmin: isAdminUser[0].admin,
      });
    }
  }
});

router.post("/token-for-ver", async (req, res) => {
  const { token, email } = req.body;
  //const salt = process.env.SECRET_KEY;

  const retrievedToken = await db.tokenRetriever(email);

  //console.log('This is my email', emailToGo)
  //console.log('This is my verifyer', verifyer);
  //console.log('This is my retrievedTOken', retrievedToken[0].loginToken)

  //here I am checking if the token which came with the http request is equal to the token which was stored in the users table
  if (!token) {
    return res
      .status(500)
      .send({ message: "Please enter valid token", verified: false });
  } else {
    if (retrievedToken[0].loginToken === token) {
      res.send({ verified: true, message: "Token verification successful" });
      await db.tokenDeleter(email);
    } else {
      res.send({
        verified: false,
        message: "Invalid token entered please enter a valid token",
      });
    }
  }
});

router.get("/questions", async (req, res) => {
  const allQuestions = await db.getQuestions();
  if (allQuestions.length === 0) {
    //console.log(allQuestions);
    return res.status(409).send({ message: "The Questions list is empty" });
  } else {
    //console.log(allQuestions);
    res.status(200).send(allQuestions);
  }
});

router.post("/question-add", async (req, res) => {
  const { emailToGo, userInput } = req.body;

  //console.log("This is email to go", emailToGo);
  //console.log("This is newPassword", userInput);

  try {
    const userid = await db.getUserIdQues(emailToGo);
    //console.log("this is userid", userid[0].id);
    await db.newQuestionInserter(userid[0].id, userInput);
    res.send({ message: "Insertion successful" });
  } catch (error) {
    console.error("There was an error executing the db function");
    res
      .status(500)
      .send({ message: "There was an error executing the db function" });
  }
});

router.post("/answers", async (req, res) => {
  //get answers for a specific question.
  const { questionId } = req.body;
  try {
    const allAnswers = await db.getAnswersForaSpecificQues(questionId);
    if (allAnswers.length === 0) {
      res
        .status(500)
        .send({ message: "There were no answers for this question" });
    } else {
      res.status(200).send(allAnswers);
    }
  } catch (error) {
    console.error("There was an error fetching data from answers ");
    res
      .status(500)
      .send({ message: "There was an error fetching data from answers" });
  }
});

router.post("/get-username", async (req, res) => {
  const { questionId } = req.body;
  try {
    const username = await db.getUserWhoAskedQues(questionId);
    //console.log(username[0][0].username);
    res.status(200).send(username[0][0].username);
  } catch (error) {
    console.error(
      "There was an error with some function when getting the username"
    );
    res
      .status(500)
      .send({ message: "There was an error when getting the username" });
  }
});

router.post("/answer-insert", async (req, res) => {
  const { emailToGo, adminVal, questionId, userInput } = req.body;
  console.log("this is email to go", emailToGo);
  console.log("this is email to go", questionId);
  console.log("this is email to go", userInput);

  if (userInput.length === 0) {
    return res.status(500).send({ message: "no reply sent" });
  } else {
    const userid = await db.getUserIdQues(emailToGo);
    console.log("this is email to go", userid);
    try {
      await db.answerInserter(questionId, userid[0].id, userInput);
      res.send({ message: "data inserted successfully" });
    } catch (error) {
      res.status(500).send({
        message: "There was an error getting userid or inserting the answer",
      });
    }
  }
});

module.exports = {
  router,
  tableCreatorChecker,
};
//module.exports.tableCreatorChecker = tableCreatorChecker;
