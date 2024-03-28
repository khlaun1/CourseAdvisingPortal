import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Backadmin() {
  const { emailToGo, adminVal } = useParams();
  const [adminData, setAdminData] = useState([]);
  const [lastApproval, setLastApproval] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseTable = await fetch(
          "http://localhost:3000/backend-admin-viewer"
        );

        const data = await responseTable.json();
        console.log(data);
        setAdminData(data);
      } catch (error) {
        console.error("There was an error getting the admin table", error);
      }
    };

    fetchData();
  }, [lastApproval]);

  const handleApproveReq = async (userreq) => {
    //eventObj.preventDefault();

    try {
      const requestApprover = await fetch(
        "http://localhost:3000/backend-admin",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emailToGo, userreq }),
        }
      );
      const approvedData = await requestApprover.json();
      console.log(approvedData);
      if (approvedData.approved) {
        setLastApproval(1);
        alert("approval successfull");
      }
    } catch (error) {
      console.error(
        "Either the user was already approved or an error approving the user"
      );
    }
  };

  return (
    <table className="min-w-full leading-normal">
      <thead>
        <tr>
          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            User Request
          </th>
          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Approval Status
          </th>
          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        {adminData.map((row, index) => (
          <tr key={index}>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p className="text-gray-900 whitespace-no-wrap">{row.userreq}</p>
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p className="text-gray-900 whitespace-no-wrap">
                {row.approval ? "Approved" : "Pending"}
              </p>
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              {!row.approval && (
                <button
                  onClick={() => handleApproveReq(row.userreq)}
                  className="text-white font-bold py-2 px-4 rounded bg-blue-500 hover:bg-blue-700"
                >
                  Approve
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Backadmin;
