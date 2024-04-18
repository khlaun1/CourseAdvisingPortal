import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function Resetpassword() {
  const { emailToGo, adminVal } = useParams();

  const [newpassword, newpassUpdate] = useState("");
  const [conpassword, conpassUpdate] = useState("");
  const navigate = useNavigate();

  const handleSubmitfinal = async (eventObj) => {
    eventObj.preventDefault();

    if (newpassword === conpassword) {
      const resetResponse = await fetch(
        "http://localhost:3000/reset-response",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emailToGo, newpassword }),
        }
      );

      const resResponseDat = await resetResponse.json();

      if (!resetResponse.ok) {
        alert(resResponseDat.message);
      } else {
        if (resResponseDat.passUpdate) {
          console.log(resResponseDat.passUpdate);
          navigate(`/login`);
        }
      }
    } else {
      alert("passwords do not match");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {" "}
      {/* Top Pane */}
      <div className="p-4 bg-gray-300 border-b border-gray-400 shadow-lg">
        <img src="/fav.png" alt="logo" className="h-12 w-12" />
      </div>
      <div className="flex-grow flex items-center justify-center">
        <div
          className="p-8 bg-white rounded-lg shadow-2xl"
          style={{ transform: "translateZ(0)" }}
        >
          {" "}
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Reset Password
          </h2>
          <form onSubmit={handleSubmitfinal} className="space-y-6">
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                htmlFor="newpassword"
              >
                New Password
              </label>
              <div className="flex items-center border rounded-lg shadow-sm overflow-hidden">
                <span className="pl-3">
                  <i className="fas fa-lock text-gray-500"></i>
                </span>
                <input
                  className="w-full px-4 py-3 focus:outline-none transition duration-200"
                  id="newpassword"
                  type="password"
                  placeholder="Enter your new password"
                  value={newpassword}
                  onChange={(e) => newpassUpdate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-semibold mb-2"
                htmlFor="conpassword"
              >
                Confirm Password
              </label>
              <div className="flex items-center border rounded-lg shadow-sm overflow-hidden">
                <span className="pl-3">
                  <i className="fas fa-lock text-gray-500"></i>
                </span>
                <input
                  className="w-full px-4 py-3 focus:outline-none transition duration-200"
                  id="conpassword"
                  type="password"
                  placeholder="confirm your new password"
                  value={conpassword}
                  onChange={(e) => conpassUpdate(e.target.value)}
                />
              </div>
            </div>
            <button
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition duration-200"
              type="submit"
            >
              Reset
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Resetpassword;
