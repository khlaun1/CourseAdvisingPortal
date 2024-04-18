import React, { useState, useEffect } from "react";
import acceptableDomains from "./Domain";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const goToLogin = () => {
    navigate("/login");
  };

  const submitHandler = async (eventObj) => {
    eventObj.preventDefault();

    const emailDomain = email.split("@")[1];
    const username = firstName + " " + lastName;
    const admin = false;
    if (acceptableDomains[emailDomain]) {
      //setMessage('The domain is valid! Proceeding with checking for duplication');

      const duplicateCheckResponse = await fetch(
        "http://localhost:3000/tableCreator-Checker",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            email,
            password,
            admin,
            firstName,
            lastName,
          }),
        }
      );

      if (!duplicateCheckResponse.ok) {
        if (duplicateCheckResponse.status === 409) {
          //which means the user already exists
          alert("User already exists, please login.");
          return;
        }
        const errMsg = await duplicateCheckResponse.json();
        if(!errMsg.passValid){
          alert("Please enter a password with with uppercase and lowercase, number and special.")
        }
        //setMessage("Error: " + errMsg);
        return;
      } else {
        if (duplicateCheckResponse.status === 409) {
          alert("User already exists, please login");
        } else {
          alert("Successfully entered the email");
        }
      }
      /*
            const duplicateCheckResult = await duplicateCheckResponse.json();
            if(duplicateCheckResult.isDuplicate){
                alert('User already exists please login.');
                return;
            }
            if(!duplicateCheckResult.isDuplicate){

            }*/
    } else {
      alert("Email domain not valid please try using a different email");
    }
    /*
        const signupResponse = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({email, password})
        });

        if(signupResponse.ok){
            setMessage('Your email will be verified and you will be able to login after some time.');

        }
        else{
            const errMsg = await signupResponse.text();
            console.log(errMsg);
            setMessage('Signup Failed: ', errMsg);
        }
*/
  };



  const [isMobile, setIsMobile] = useState(isMobileDevice());

useEffect(() => {
  function handleResize() {
    setIsMobile(isMobileDevice());
  }

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);


function isMobileDevice() {
  return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
}




  return (
    <div className="flex items-center justify-center min-h-screen bg-teal-700 p-4">
      <div className="w-full max-w-lg p-10 bg-white rounded-lg shadow-2xl">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">
          Signup
        </h2>
        <form onSubmit={submitHandler}>
          <div className="mb-6">
            <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="firstName">
              First Name
            </label>
            <input
              className="w-full px-4 py-3 text-gray-700 border rounded-lg shadow-sm focus:outline-none focus:shadow-outline"
              id="firstName"
              type="text"
              placeholder="Enter your First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
  
          <div className="mb-6">
            <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="lastName">
              Last Name
            </label>
            <input
              className="w-full px-4 py-3 text-gray-700 border rounded-lg shadow-sm focus:outline-none focus:shadow-outline"
              id="lastName"
              type="text"
              placeholder="Enter your Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
  
          <div className="mb-6">
            <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="email">
              Email
            </label>
            <input
              className="w-full px-4 py-3 text-gray-700 border rounded-lg shadow-sm focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
  
          <div className="mb-8">
            <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              className="w-full px-4 py-3 text-gray-700 border rounded-lg shadow-sm focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
  
          <div className="flex items-center justify-between">
            <button
              className="w-full py-3 font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Signup
            </button>
          </div>
        </form>
  
        {message && (
          <div className="mt-4 text-sm text-center text-green-600">
            {message}
          </div>
        )}
  
        <button
          onClick={goToLogin}
          className="absolute top-3 right-3 px-4 py-2 text-sm font-semibold text-black bg-white rounded hover:bg-gray-700 focus:outline-none focus:shadow-outline"
        >
          Log In
        </button>
      </div>
    </div>
  );
}

export default Signup;
