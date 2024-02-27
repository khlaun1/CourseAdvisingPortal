const mysql = require('mysql2/promise')
const bcrpyt = require('bcrypt')

//the function below creates a connection pool
const dbconn = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Rahul@12345.p',
    database: 'Course_Advising_Portal'
});


//function for altering the columns
const columnadder = async () => {
    const alterer = 'ALTER TABLE users ADD COLUMN email VARCHAR(255)';
    try {
        await dbconn.query(alterer);
        console.log('Column added or already exists');
    } catch (err) {
        console.error('Error altering the table', err);
        throw err;
    }
};

//function for creating table


const adminColumnAdder = async () =>{
    const adminColumnQuery = 'ALTER TABLE users ADD COLUMN admin boolean DEFAULT 0'
    try {
        await dbconn.query(adminColumnQuery);
        console.log('column add or already exists')
    } catch (err){
        console.error('Error altering table to add admin column!', err);
        throw err;
    }
}



const tableCreator = async () => {
    const tableCreation = 'CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL)';
    try {
        await dbconn.query(tableCreation);
        console.log("Table created or already exists");
    } catch (err) {
        console.error('Error creating table', err);
        throw err;
    }
};


//function to check if a table exists
const existenceChecker = async (tableName) => {
    const tableChecker = "SELECT count(*) as count FROM information_schema.tables WHERE table_schema='course_advising_portal' AND table_name=?";
    try {
        const [result] = await dbconn.query(tableChecker, [tableName]);
        return result[0].count > 0;
    } catch (err) {
        console.error('Error checking if table exists', err);
        throw err;
    }
};




//function for inserting data
const insertData = async (id, username, email, password, admin) => {
    const SignupInserter = 'INSERT INTO users (id, username, email, password, admin) VALUES (?, ?, ?, ?, ?)';
    try {
        await dbconn.query(SignupInserter, [id, username, email, password, admin]);
    } catch (err) {
        console.error('Error running the insertion query', err);
        throw err;
    }
};



//will write in the callback to call the adminchecker function and check if the
//request is already there or not. 
const adminInserter = async (email, callback) =>{
    const adminQuery = 'INSERT INTO admin (userreq, approval) VALUES (?, FALSE)';
    await dbconn.query(adminQuery, [email], (err)=>{
        if(err){
            console.error('Error running the insertion query');
            callback(err);
        }
        callback(null);
    })

}

const approvedOrNot = async (email) =>{
    const approvedOrNotQuery = 'SELECT approval FROM users WHERE userreq=?';
    const approvedOrNotResult = await dbconn.query(approvedOrNotQuery, [email]);
    return approvedOrNotResult[0];
}


const adminChecker = async (email)=>{
    const adminCheckerQuery = 'SELECT approval from admin where userreq=?';
    const adminResults = await dbconn.query(adminCheckerQuery, [email]);
    console.log(adminResults[0].length);
    if(adminResults[0].length>0){
        return true;
    }
    else{
        return false;
    }
    
}

const getUserByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    const results = await dbconn.query(query, [email]);
    //console.log('results', results)
    return results[0];  
    
};

const userVerifyer = async (email, password) =>{
    const user = await getUserByEmail(email)
    if(!user){
        return {success:false, message:'User Not Found '};
    }
    //console.log(password)
    //console.log(user[0].password)
    const match = await bcrpyt.compare(password, user[0].password);
    let response = {
        success:"",
        message:""
    }

    if(match){
        response = {
            success:true,
            message: "password verified"
        }
        
        
        
    }else{
        response = {
            success:false,
            message: "incorrect password"
        }
    }
    return response;

}

const deleteReq = async (email, approval)=>{
    const deleteReqQuery = 'DELETE FROM admin WHERE userreq=? AND approval=TRUE';
    await dbconn.query(deleteReqQuery, [email, approval], (err)=>{
        if(err){
            console.error('Error deleting the request')
        }
    });
}

const getId = async (email)=>{
    const getIdQuery = 'SELECT * FROM users WHERE email=?';
    const getIdResult = await dbconn.query(getIdQuery, [email]);
    return getIdResult;
}


const getApprovalStatus = async(email)=>{
    const getApprovalQuery = 'SELECT approval from admin where userreq=?';
    const getApprovalResult = await dbconn.query(getApprovalQuery, [email]);
    //console.log(getApprovalResult);
    return getApprovalResult[0];
}

const getUserById = async (id) => {
    const query = 'SELECT * FROM users WHERE id = ?';
    const results = await dbconn.query(query, [id]);
    //console.log('results', results)
    return results[0];  
    
};




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
    getUserById
}


