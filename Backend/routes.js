const admincred = require('./admincred');
const express = require('express')
const router = express.Router()
const db = require('./Database/db')
const checkDuplicateEmail = require('./Database/duplicateChecker')
const bcrypt = require('bcrypt')
//const validEmail = require('./Database/validLogin')
const nj = require('./nodeMailerjwt');
require('dotenv').config();

router.post('/tableCreator-Checker', async (req, res) => {
    const { id, username, email, password, admin} = req.body;
    const newPassword = await bcrypt.hash(password, 10); // Assuming you use bcrypt for password hashing

    
    try {
        // Attempt to create the table
        await db.tableCreator();
        

        // Check if the 'users' table exists
        const exists = await db.existenceChecker('users');
        if (!exists) {
            return res.status(500).send('Error: Table does not exist');
        }

        // Check for duplicate email
        const isDuplicate = await checkDuplicateEmail(email); // Ensure this function returns a promise
        console.log(isDuplicate)
        if (isDuplicate) {
            return res.status(409).send('Duplicate Email! The email already exists, try logging in');
        }

        // Insert the data into the table
        await db.insertData(id, username, email, newPassword, admin);
        res.send('Data inserted successfully!');
    } catch (error) {
        console.error('Error in route handler:', error);
        res.status(500).send('Error processing your request');
    }
});






router.post('/valid-email', async (req, res)=>{
    const {email, password} = req.body;
    
    //console.log("Received email:", email);
    //console.log("Received password:", password);
    //console.log("Admin email:", admincred.email);
    //console.log("Admin password:", admincred.password);


    const isAdminUser = await db.getUserByEmail(email);
    //console.log(isAdminUser)
    if(isAdminUser.length===0){
        res.status(409).send('The email is invalid please try entering a valid email')
    }
    else if(isAdminUser[0].admin){
        //redirect to the profile page.
        const userPasswordChecker = await db.userVerifyer(email, password);
        if(userPasswordChecker.success){
            res.json({isAdmin:true})

        }else{
            res.status(409).send('Please enter a valid email or password');
        }        
    }
    else{
        //console.log(email, password)
        //console.log(await db.getUserByEmail(email));
        const userPasswordChecker = await db.userVerifyer(email, password);
        //console.log(userPasswordChecker);
        if(userPasswordChecker.success){/*
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
            
            if(adminCheckerVar){
                //console.log(adminCheckerVar)
                const approvalStatusInd = await db.getApprovalStatus(email);
                if(approvalStatusInd[0].approval){
                    await db.deleteReq(email);
                    nj.sendVerificationEmail(userRow, token);
                    res.json({message:'Verification email sent'});

                }
                if(!approvalStatusInd[0].approval){
                    res.send({message:'Approval Pending please wait for admin to approve'})
                }


            }
            if(!adminCheckerVar){
                //console.log(adminCheckerVar)
                await db.adminInserter(email, (err)=>{
                    if(err){
                        res.status(500).send('Error querying admin inserter');
                    }
                })
                res.send('Approval Pending, Please wait for the admin to approve')
            }
            
            //console.log(adminCheckerVar)
/*
            db.adminChecker(email, async (rowsFound) => {
                console.log('inside adminchecker')
                
                if(adminErr){
                    res.status(500).json({message:'Error querying the admin database'});
                }
                //if isApproved true that means that an entry was found. And not that the
                //admin approved the login request.
                console.log(rowsFound)
                if(rowsFound){
                    console.log('I am here');
                    const approvalCheck = db.approvedOrNot(email);
                    console.log(approvalCheck);
                    if(approvalCheck){
                        //send verification link as the approval field is true.
                        db.deleteReq(email, approvedOrNot);
                        nj.sendVerificationEmail(userRow, token);
                        res.json({message:'Verification email sent'});

                    }
                    else if(!approvalCheck){
                        //it means that the request hasn't been approved yet.
                        res.status(409).json({message:'Approval pending! Wait for the admin to approve your request and try again after some time'});
    
                    }
    
                }
                else if(!rowsFound){
                    console.log('Iam Here');
                    db.adminInserter(email, (insErr)=>{
                        if(insErr){
                            res.status(500).json({message:"Error Inserting the login request"});
                        }
                        res.json({message:'Login request successfully inserted! Approval pending, please try logging in after some time.'})
                    });
                }
                
            })*/
        }
    
    }

})







router.get('/api/profile/:token', (req, res) => {
    const { token } = req.params;
    const secret = process.env.SECRET_KEY;

    jwt.verify(token, secret, async (err, decoded) => {
        if (err) {
            return res.status(401).send('Invalid or expired token');
        }

        const userId = decoded.userId;
        console.log(userId)
        try{
            const user = await db.getUserById(userId);
            res.json(user);
        }catch(dbError){
            res.status(500).send("error fetching the user data")
        }

        res.send('Account verified successfully');
    });
});





module.exports = router;