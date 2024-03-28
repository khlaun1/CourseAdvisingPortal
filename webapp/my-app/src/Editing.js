// {
//   Array.from({ length: numRowsC }, (_, i) => (
//     <div key={i} className="flex items-center space-x-2">
//       <div className="w-1/2">
//         <label
//           htmlFor={`levelC-${i}`}
//           className="block text-gray-700 font-bold mb-2"
//         >
//           Select Level
//         </label>
//         <select
//           id={`levelC-${i}`}
//           value={levelsC[i]}
//           onChange={(event) => handleChangeLevelC(event, i)}
//           className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
//         >
//           <option value={0}>Select a Level</option>
//           <option value={100}>100</option>
//           <option value={200}>200</option>
//           <option value={300}>300</option>
//           <option value={400}>400</option>
//           {/* Add more options as needed */}
//         </select>
//       </div>
//       <div className="w-1/2">
//         <label
//           htmlFor={`course-${i}`}
//           className="block text-gray-700 font-bold mb-2"
//         >
//           Select Course
//         </label>
//         <select
//           id={`course-${i}`}
//           value={selectedCourses[i]}
//           onChange={(event) => handleChangeCourse(event, i)}
//           className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
//         >
//           <option value="">Select Course</option>
//           {filteredCourses[i] &&
//             filteredCourses[i].map((course) => (
//               <option key={`${course.courseid}-${i}`} value={course.courseid}>
//                 {course.coursename} ({course.courselevel})
//               </option>
//             ))}
//         </select>
//       </div>
//     </div>
//   ));
// }
// <div>
//   <button
//     type="button"
//     onClick={handleSubmitRowsC}
//     className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
//   >
//     Add Row
//   </button>
// </div>;

{
  /* <div>
  <label className="block text-sm font-semibold mb-2" htmlFor="lastGPA">
    Last GPA
  </label>
  <div className="flex items-center border rounded-lg shadow-sm overflow-hidden">
    <span className="pl-3">
      <i className="fas fa-envelope text-gray-500"></i>
    </span>
    <input
      className="w-full px-4 py-3 focus:outline-none transition duration-200"
      id="lastGPA"
      type="lastGPA"
      placeholder="Enter your last GPA(Just the number e.g. 2.2)"
      value={lgpa}
      onChange={(e) => setLastGPA(e.target.value)}
    />
  </div>
</div>;

<div>
  <label className="block text-sm font-semibold mb-2" htmlFor="currentterm">
    Current Term
  </label>
  <div className="flex items-center border rounded-lg shadow-sm overflow-hidden">
    <span className="pl-3">
      <i className="fas fa-envelope text-gray-500"></i>
    </span>
    <input
      className="w-full px-4 py-3 focus:outline-none transition duration-200"
      id="currentterm"
      type="currentterm"
      placeholder="Enter your Current Term(please enter spring, fall or summer)"
      value={ct}
      onChange={(e) => setCurrentTerm(e.target.value)}
    />
  </div>
</div>; */
}

// return (
//   <div className="container mx-auto p-6">
//     <h2 className="text-xl font-semibold mb-4">
//       {student_name}'s Advising Records
//     </h2>
//     <table className="table-auto w-full border-collapse border border-slate-400">
//       <thead className="bg-gray-100">
//         <tr className="bg-gray-100">
//           <th className="border border-slate-300 p-3">Student ID</th>
//           <th className="border border-slate-300 p-3">Last Term</th>
//           <th className="border border-slate-300 p-3">Last GPA</th>
//           <th className="border border-slate-300 p-3">Current Term</th>
//           <th className="border border-slate-300 p-3">Date Submitted</th>
//           <th className="border border-slate-300 p-3">Course Plan</th>
//           <th className="border border-slate-300 p-3">Prerequisites</th>
//           <th className="border border-slate-300 p-3">Status</th>
//         </tr>
//       </thead>
//       <tbody>
//         {advisingRecords.map((record, idx) => (
//           <tr
//             key={`${record.advisingId}-${idx}`}
//             className="bg-white hover:bg-gray-50"
//           >
//             <td className="px-5 py-5 border-b border-gray-200 text-sm">
//               {record.student_id}
//             </td>
//             <td className="px-5 py-5 border-b border-gray-200 text-sm">
//               {record.last_term}
//             </td>
//             <td className="px-5 py-5 border-b border-gray-200 text-sm">
//               {record.last_gpa}
//             </td>
//             <td className="px-5 py-5 border-b border-gray-200 text-sm">
//               {record.current_term}
//             </td>
//             <td className="px-5 py-5 border-b border-gray-200 text-sm">
//               {record.date_submitted}
//             </td>
//             <td className="px-5 py-5 border-b border-gray-200 text-sm">
//               {record.courseplan}
//             </td>
//             <td className="px-5 py-5 border-b border-gray-200 text-sm">
//               {record.prerequisites}
//             </td>
//             <td className="px-5 py-5 border-b border-gray-200 text-sm">
//               {record.status}
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>
// );

{
  /* <div className="mb-6">
<label
  className="block mb-2 text-sm font-bold text-gray-700"
  htmlFor="firstName"
>
  First Name
</label>
<input
  className="w-full px-4 py-3 text-gray-700 border rounded-lg shadow-sm focus:outline-none focus:shadow-outline"
  id="firstName"
  type="firstName"
  placeholder="Enter your First Name"
  value={firstName}
  onChange={(eventObj) => setFirstName(eventObj.target.value)}
/>
</div>



<div className="mb-6">
<label
  className="block mb-2 text-sm font-bold text-gray-700"
  htmlFor="lastName"
>
  Last Name
</label>
<input
  className="w-full px-4 py-3 text-gray-700 border rounded-lg shadow-sm focus:outline-none focus:shadow-outline"
  id="lastName"
  type="lastName"
  placeholder="Enter your Last Name"
  value={lastName}
  onChange={(eventObj) => setLastName(eventObj.target.value)}
/>
</div> */
}
