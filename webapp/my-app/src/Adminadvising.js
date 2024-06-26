import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function Adminadvising() {
  const [records, setRecords] = useState([]);
  const { emailToGo, adminVal } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        "http://localhost:3000/api/advising-records"
      );
      console.log(response);
      const data = await response.json();
      console.log(data);

      setRecords(data);
    };

    fetchData();
  }, []);

  const handleStudentClick = (studentId, studentName) => {
    let student_id = studentId;
    let student_name = studentName;
    navigate(
      `/profile/adminAdvisingUser/${emailToGo}/${adminVal}/${student_id}/${student_name}`
    );
  };

  const handleHome = async (eventObj) => {
    eventObj.preventDefault();
    navigate(`/profile/${emailToGo}/${adminVal}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex justify-end p-2 md:p-4 bg-gray-300 border-b border-gray-400 shadow-lg">
        <img src="/fav.png" alt="logo" className="h-12 w-12 mr-auto" />
        <button
          onClick={handleHome}
          className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
        >
          Home
        </button>
      </div>
      <div className="container mx-auto px-4 md:p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-slate-400">
            <thead>
              <tr className="bg-gray-100">
                <th scope="col" className="border border-slate-300 p-2 md:p-3">
                  Student ID
                </th>
                <th scope="col" className="border border-slate-300 p-2 md:p-3">
                  Student Name
                </th>
                <th scope="col" className="border border-slate-300 p-2 md:p-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, idx) => (
                <tr
                  key={`${record.student_id}-${idx}`}
                  className="odd:bg-white even:bg-gray-50 hover:bg-gray-200"
                >
                  <td className="border border-slate-300 p-2 md:p-3">
                    {record.student_id}
                  </td>
                  <td className="border border-slate-300 p-2 md:p-3">
                    <button
                      onClick={() =>
                        handleStudentClick(
                          record.student_id,
                          record.student_name
                        )
                      }
                      className="text-blue-600 hover:underline"
                    >
                      {record.student_name}
                    </button>
                  </td>
                  <td className="border border-slate-300 p-2 md:p-3">
                    {record.status}
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

export default Adminadvising;
