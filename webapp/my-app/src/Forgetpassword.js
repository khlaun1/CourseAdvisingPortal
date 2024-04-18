import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Forgetpassword() {
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

  const submitHandler = async (eventObj) => {
    eventObj.preventDefault();
    const response = await fetch(
      "http://localhost:3000/forget-passw-email-ver",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();
    if (response.ok) {
      const adminVal = data.isAdmin;
      alert(data.message);
      navigate(`/tok-verification/${email}/${adminVal}`);
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-500 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-2xl">
        <h2 className="text-xl md:text-2xl font-semibold mb-6 text-gray-800">
          Email Verification
        </h2>
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
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <button
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition duration-200"
            type="submit"
          >
            Send Token
          </button>
        </form>
      </div>
    </div>
  );
}

export default Forgetpassword;
