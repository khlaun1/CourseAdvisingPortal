import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, emailUpdate] = useState("");
  const [password, passUpdate] = useState("");
  const [message, setMessage] = useState("");
  const verifyer = "";

  const navigate = useNavigate();
  const goToSignup = () => {
    navigate("/signup");
  };

  const submitHandler = async (eventObj) => {
    eventObj.preventDefault();
    //fetching the valid email endpoint
    const validEmailResponse = await fetch(
      "http://localhost:3000/valid-email",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    const responseData = await validEmailResponse.json();
    //const responsetext = validEmailResponse.text();

    const emailToGo = email;

    //console.log('This is the response data', responseData);
    //console.log('This is the reponsetext', responsetext);

    //checking if the response is 200 or not
    if (!validEmailResponse.ok) {
      if (validEmailResponse.status === 409) {
        alert("invalid email or password entered please try again");
      }
      return;
    }

    //if it is 200 i.e. ok
    else if (validEmailResponse.ok) {
      //console.log(responseData.isAdmin)
      //if the user entering the email is admin or not
      const iniAdminVal = responseData.isAdmin;

      const adminVal = iniAdminVal;
      console.log("This is my response data", responseData);
      console.log("This is the value of my admin val", adminVal);
      if (responseData.isAdmin) {
        //console.log('in this conditional')

        console.log("This is the value of my admin val in is admin", adminVal);

        navigate(`/profile/${emailToGo}/${adminVal}`);
      } else if (!responseData.isAdmin) {
        if (responseData.adminApproval) {
          console.log(
            "This is the value of my admin val in not is admin",
            adminVal
          );
          navigate(`/verification/${emailToGo}/${adminVal}`);
        } else if (!responseData.adminApproval) {
          //console.log('Here waiting for the admin to approve');
          alert("Waiting for approval from admin!");
        }
      }
    }
    // else{
    //     console.log('in this conditional')
    //     //alert(responseData.message);
    //     setMessage('valid email please try logging in again after some time.')

    // }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-500">
      <div className="p-8 bg-white rounded-lg shadow-2xl">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Login</h2>
        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="email">
              Email
            </label>
            <div className="flex items-center border rounded-lg shadow-sm overflow-hidden">
              <span className="pl-3">
                <i className="fas fa-envelope text-gray-500"></i>
              </span>
              <input
                className="w-full px-4 py-3 focus:outline-none transition duration-200"
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => emailUpdate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <div className="flex items-center border rounded-lg shadow-sm overflow-hidden">
              <span className="pl-3">
                <i className="fas fa-lock text-gray-500"></i>
              </span>
              <input
                className="w-full px-4 py-3 focus:outline-none transition duration-200"
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => passUpdate(e.target.value)}
              />
            </div>
          </div>
          <button
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition duration-200"
            type="submit"
          >
            Login
          </button>

          {message && (
            <div
              className={`mt-4 text-sm ${
                message.type === "error" ? "text-red-500" : "text-green-500"
              }`}
            >
              {message.text}
            </div>
          )}
        </form>
        <button
          onClick={goToSignup}
          className="absolute top-3 right-3 px-4 py-2 text-sm font-semibold text-zinc-90 bg-neutral-50 rounded hover:bg-gray-700 focus:outline-none focus:shadow-outline"
        >
          Register
        </button>
      </div>
    </div>
  );
}

export default Login;
