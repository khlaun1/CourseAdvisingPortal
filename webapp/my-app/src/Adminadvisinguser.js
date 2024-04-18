import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function Adminadvisinguser() {
  const [advisingRecords, setAdvisingRecords] = useState([]);
  const { student_id, emailToGo, adminVal, student_name } = useParams();
  const [change, setChange] = useState(0);

  const [textInput, setTextInput] = useState("");
  const [storedText, setStoredText] = useState("");
  const [userid, setUserid] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    //console.log(advisingRecords);
    const rejectionFetch = async () => {
      const response = await fetch(
        "http://localhost:3000/api/rejection-email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storedText, userid }),
        }
      );
      if (response.ok) {
        alert("email sent successfully");
      }
    };
    rejectionFetch();
  }, [storedText, userid]);

  useEffect(() => {
    const fetchAdvisingRecords = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/admin-advising-user-records",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ student_id }),
          }
        );
        //console.log(response);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();

        setAdvisingRecords(data);
      } catch (error) {
        console.error("Error fetching advising records:", error);
      }
    };
    fetchAdvisingRecords();
  }, []);

  const handleRejection = async () => {
    let rejectionReason = await prompt("Enter you reason for rejection: ");
    if (rejectionReason !== null) {
      setStoredText(rejectionReason);
    }
  };

  const handleStatusChange = async (advisingId, studentId, newStatus) => {
    // Update the status in the backend
    /*
    if (newStatus === "rejected") {
      //await handleNotOkResponse();
      await handleRejection();
    }*/
    try {
      const statusResponse = await fetch(
        "http://localhost:3000/api/advising/update",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            advisingId,
            newStatus,
            studentId,
            storedText,
          }),
        }
      );
      console.log(statusResponse);
      const statusData = await statusResponse.json();
      console.log(statusData);

      if (statusResponse.ok) {
        if (statusData.formStatus) {
          alert("approved and data inserted successfully");
        } else if (!statusData.formStatus) {
          //handleRejection(studentId);
          setUserid(studentId);
          await handleRejection();
          alert("The request form has been rejected");
        }
      } else if (!statusResponse.ok) {
        console.log(statusResponse);
      }

      setAdvisingRecords(
        advisingRecords.map((record) =>
          record.advisingId === advisingId
            ? { ...record, status: newStatus }
            : record
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleHome = async (eventObj) => {
    eventObj.preventDefault();
    navigate(`/profile/${emailToGo}/${adminVal}`);
  };

  //return statement starting

  return (
    <div>
      <div className="flex justify-end p-4 bg-gray-300 border-b border-gray-400 shadow-lg">
        <img src="/fav.png" alt="logo" className="h-12 w-12 mr-auto" />
        <button
          onClick={handleHome}
          className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
        >
          Home
        </button>
      </div>
      <div className="container mx-auto p-6">
        <h2 className="text-xl font-semibold mb-4">
          {student_name}'s Advising Records
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-slate-400">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-slate-300 p-3">Student ID</th>
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
                    {record.status === "pending" ? (
                      <select
                        className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        value={record.status}
                        onChange={(e) =>
                          handleStatusChange(
                            record.advisingId,
                            record.student_id,
                            e.target.value
                          )
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    ) : (
                      record.status
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Adminadvisinguser;
