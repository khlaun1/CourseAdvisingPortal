import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function Viewrecords() {
  const { emailToGo, adminVal } = useParams();
  const [advisingRecords, setAdvisingRecords] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log(advisingRecords);
  }, [advisingRecords]);

  useEffect(() => {
    const fetchUserData = async () => {
      const responseUser = await fetch(
        "http://localhost:3000/api/view-advising",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emailToGo }),
        }
      );
      const responseUserData = await responseUser.json();
      console.log(responseUserData);
      setAdvisingRecords(responseUserData);
    };
    fetchUserData();
  }, []);

  const handleHome = async (eventObj) => {
    eventObj.preventDefault();
    navigate(`/profile/${emailToGo}/${adminVal}`);
  };

  return (
    <div>
      <div className="flex justify-end p-4 bg-gray-300 border-b border-gray-400 shadow-lg">
        <button
          onClick={handleHome}
          className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
        >
          Home
        </button>
      </div>
      <div className="container mx-auto p-6">
        <h2 className="text-xl font-semibold mb-4">Your Advising Records</h2>
        <table className="table-auto w-full border-collapse border border-slate-400">
          <thead className="bg-gray-100">
            <tr className="bg-gray-100">
              <th className="border border-slate-300 p-3">Student ID</th>
              <th className="border border-slate-300 p-3">Student Name</th>
              <th className="border border-slate-300 p-3">Last Term</th>
              <th className="border border-slate-300 p-3">Last GPA</th>
              <th className="border border-slate-300 p-3">Current Term</th>
              <th className="border border-slate-300 p-3">Date Submitted</th>
              <th className="border border-slate-300 p-3">Course Plan</th>
              <th className="border border-slate-300 p-3">Prerequisites</th>
              <th className="border border-slate-300 p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {advisingRecords.map((record, idx) => (
              <tr
                key={`${record.advisingId}-${idx}`}
                className="bg-white hover:bg-gray-50"
              >
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                  {record.student_id}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                  {record.student_name}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                  {record.last_term}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                  {record.last_gpa}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                  {record.current_term}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                  {record.date_submitted}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                  {record.courseplan}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                  {record.prerequisites}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                  {record.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Viewrecords;
