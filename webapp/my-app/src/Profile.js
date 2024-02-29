import React, { useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';


function Profile() {
    const {emailToGo, adminVal} = useParams();


    const navigate = useNavigate();
    const handleSubmitReset = async(eventObj)=>{
        eventObj.preventDefault();

        navigate(`/profile/resetpassword/${emailToGo}/${adminVal}`)
    }

    const handleSubmitUpdate = async(eventObj)=>{
        eventObj.preventDefault();
    }

    return(
    <div className="flex flex-col h-screen">
      {/* Top right corner button */}
      <div className="flex justify-end p-4">
        <button onClick={handleSubmitReset}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Reset Password
        </button>
      </div>

      {/* Center box for user name */}
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-white p-10 rounded-lg shadow-xl">
          <h1 className="text-2xl font-bold text-center mb-4">User Profile</h1>
          <p className="text-xl text-gray-800 text-center">{emailToGo}</p>
          
        </div>
      </div>
    </div>
    );
}

export default Profile;
