import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Courseadd from "./Courseadd";

function Profile() {
  const { emailToGo, adminVal } = useParams();
  const adminCheck = adminVal === "true";

  const [mainDropdownOpen, setMainDropdownOpen] = useState(false);
  const [advisingDropdownOpen, setAdvisingDropdownOpen] = useState(false);
  const toggleMainDropdown = () => {
    setMainDropdownOpen(!mainDropdownOpen);
  };
  const toggleAdvisingDropdown = () => {
    setAdvisingDropdownOpen(!advisingDropdownOpen);
  };

  const navigate = useNavigate();
  const handleSubmitReset = async (eventObj) => {
    eventObj.preventDefault();

    navigate(`/profile/resetpassword/${emailToGo}/${adminVal}`);
  };

  const handleSubmitAdvisingAdmin = async (eventObj) => {
    eventObj.preventDefault();
    navigate(`/profile/advisingadmin/${emailToGo}/${adminVal}`);
  };

  const handleSubmitAdmin = async (eventObj) => {
    eventObj.preventDefault();

    navigate(`/profile/${emailToGo}/${adminVal}/adminApprover`);
  };

  const handleSubmitPreReq = async (eventObj) => {
    eventObj.preventDefault();

    navigate(`/profile/${emailToGo}/${adminVal}/preReq`);
  };

  //submit handler for submitting a course advising form
  const handleSubmitCourseAdvising = async (eventObj) => {
    eventObj.preventDefault();
    navigate(`/profile/${emailToGo}/${adminVal}/course-advising-form`);
  };

  //submit handler for viewing course advising records
  const handleSubmitViewRecords = async (eventObj) => {
    eventObj.preventDefault();
    navigate(`/profile/${emailToGo}/${adminVal}/studentRecord`);
  };

  //   const handleSubmitUpdate = async (eventObj) => {
  //     eventObj.preventDefault();
  //   };

  const handleSubmitLogout = async (eventObj) => {
    eventObj.preventDefault();
    navigate(`/login`);
  };

  const handleSubmitUpdateProfile = async (eventObj) => {
    eventObj.preventDefault();
    navigate(`/profile/${emailToGo}/${adminVal}/profileupdater`);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top Pane */}
      <div className="flex justify-end p-4 bg-gray-300 border-b border-gray-400 shadow-lg">
        {/* Advising Dropdown Button */}

        <div className="relative mr-4">
          <button
            onClick={toggleAdvisingDropdown}
            className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
          >
            Advising
          </button>

          {/* Advising Dropdown Menu */}
          {advisingDropdownOpen && (
            <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-xl">
              {adminCheck && (
                <div>
                  <button
                    onClick={handleSubmitAdvisingAdmin}
                    className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white w-full text-left"
                  >
                    View Advising Form Requests
                  </button>
                  <button
                    onClick={handleSubmitPreReq}
                    className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white w-full text-left"
                  >
                    Modify Courses
                  </button>
                </div>
              )}
              <button
                onClick={handleSubmitCourseAdvising}
                className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white w-full text-left"
              >
                Advising Form
              </button>
              <button
                onClick={handleSubmitViewRecords}
                className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white w-full text-left"
              >
                View Records
              </button>
            </div>
          )}
        </div>

        {/* Main Dropdown Button */}
        <div className="relative">
          <button
            onClick={toggleMainDropdown}
            className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
          >
            Options
          </button>

          {/* Main Dropdown Menu */}
          {mainDropdownOpen && (
            <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-xl">
              <button
                onClick={handleSubmitReset}
                className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white w-full text-left"
              >
                Reset Password
              </button>

              <button
                onClick={handleSubmitUpdateProfile}
                className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white w-full text-left"
              >
                Profile
              </button>

              <button
                onClick={handleSubmitLogout}
                className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white w-full text-left"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center">
        <div className="bg-white p-10 rounded-lg">
          <h1 className="text-2xl font-bold text-center mb-4">Welcome!</h1>
          <p>{emailToGo}</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
