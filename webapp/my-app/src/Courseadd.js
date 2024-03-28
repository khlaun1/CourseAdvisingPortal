import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function Courseadd() {
  const { emailToGo, adminVal } = useParams();
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [newPrerequisite, setNewPrerequisite] = useState({
    courseid: "",
    coursename: "",
    courselevel: "",
  });
  const [newCourse, setNewCourse] = useState({
    courseid: "",
    coursename: "",
    courselevel: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/courses");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        let data = await response.json();

        //console.log(data);
        setCourses(data);
        //console.log(courses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  const handlePrerequisiteChange = async (e) => {
    await setNewPrerequisite({
      ...newPrerequisite,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddPrerequisite = async (courseId) => {
    if (newPrerequisite.courseid === courseId) {
      alert("A course cannot be its own prerequisite.");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:3000/api/premodify/${courseId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newPrerequisite),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Error adding prerequisite:", error);
      // Handle error
    }
  };

  const handleRemovePrerequisite = async (courseId, prerequisite) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/courses/${courseId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(prerequisite),
        }
      );
      console.log("reponse from delete", response);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Error removing prerequisite:", error);
    }
  };

  const handleCourseChange = (e) => {
    setNewCourse({ ...newCourse, [e.target.name]: e.target.value });
  };

  const handleSubmitCourse = async (e) => {
    e.preventDefault();

    try {
      console.log(newCourse);
      //newCourse.courseid = newCourse.courseid.trim();
      //newCourse.coursename = newCourse.coursename.trim();
      //newCourse.courselevel = newCourse.courselevel.trim();
      const response = await fetch(`http://localhost:3000/api/newcourse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCourse),
      });

      if (response.ok) {
        setNewCourse({ courseid: "", coursename: "", courselevel: "" });
        setShowAddCourseForm(false);
      } else {
      }
    } catch (error) {
      console.error("Error adding course:", error);
    }
  };
  const getParsedPrerequisites = (course) => {
    //console.log("course.prerequisites:", course.prerequisites); // Inspect the data
    if (course.prerequisites.length === 0) {
      return [];
    }

    return course.prerequisites.map((preString) => JSON.parse(preString));
  };

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
        <button
          className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-green-300"
          onClick={() => setShowAddCourseForm(true)}
        >
          Add New Course
        </button>
        <table className="table-auto w-full border-collapse border border-slate-400">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-slate-300 p-3">Course ID</th>
              <th className="border border-slate-300 p-3">Course Name</th>
              <th className="border border-slate-300 p-3">Course Level</th>
              <th className="border border-slate-300 p-3">Prerequisites</th>
              <th className="border border-slate-300 p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr
                key={course.courseid}
                className="odd:bg-white even:bg-gray-50"
              >
                <td className="border border-slate-300 p-3">
                  {course.courseid}
                </td>
                <td className="border border-slate-300 p-3">
                  {course.coursename}
                </td>
                <td className="border border-slate-300 p-3">
                  {course.courselevel}
                </td>
                <td className="border border-slate-300 p-3">
                  {getParsedPrerequisites(course).map((pre, index) => (
                    <div key={index}>
                      {pre.courseid}-{pre.coursename}({pre.courselevel})
                    </div>
                  ))}
                </td>
                <td className="border border-slate-300 p-3">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => {
                      setSelectedCourse(course);
                      setShowForm(true);
                    }}
                  >
                    Modify Prerequisites
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showAddCourseForm && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Add New Course</h2>
            <form onSubmit={handleSubmitCourse}>
              <div className="mb-4">
                <label htmlFor="courseid">Course ID:</label>
                <input
                  type="text"
                  id="courseid"
                  name="courseid"
                  value={newCourse.courseid}
                  onChange={handleCourseChange}
                  className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring focus:ring-blue-300"
                  required
                />
              </div>
              {/* Add similar input fields for coursename and courselevel */}

              <div className="mb-4">
                <label htmlFor="coursename">Course Name:</label>
                <input
                  type="text"
                  id="coursename"
                  name="coursename"
                  value={newCourse.coursename}
                  onChange={handleCourseChange}
                  className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring focus:ring-blue-300"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="courselevel">Course Level:</label>
                <input
                  type="text"
                  id="courselevel"
                  name="courselevel"
                  value={newCourse.courselevel}
                  onChange={handleCourseChange}
                  className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring focus:ring-blue-300"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-green-300"
              >
                Add Course
              </button>
            </form>
          </div>
        )}

        {showForm && selectedCourse && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4">
              Modify Prerequisites for Course ID: {selectedCourse.courseid}
            </h2>
            <form>
              <div className="mb-4">
                <input
                  type="text"
                  name="courseid"
                  value={newPrerequisite.courseid}
                  onChange={handlePrerequisiteChange}
                  className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="prereq-coursename">
                  Prerequisite Course Name:
                </label>
                <input
                  type="text"
                  id="prereq-coursename"
                  name="coursename"
                  value={newPrerequisite.coursename}
                  onChange={handlePrerequisiteChange}
                  className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="prereq-courselevel">
                  Prerequisite Course Level:
                </label>
                <input
                  type="text"
                  id="prereq-courselevel"
                  name="courselevel"
                  value={newPrerequisite.courselevel}
                  onChange={handlePrerequisiteChange}
                  className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddPrerequisite(selectedCourse.courseid)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-green-300"
              >
                Add Prerequisite
              </button>
            </form>

            <div className="mt-4">
              <h3>Existing Prerequisites:</h3>
              {selectedCourse.prerequisites.length === 0 ? (
                <p>No prerequisites added yet.</p>
              ) : (
                <ul>
                  {getParsedPrerequisites(selectedCourse).map((pre) => (
                    <li
                      key={`${pre.courseid}-${pre.coursename}`}
                      className="flex items-center"
                    >
                      <span className="mr-2">
                        {pre.courseid}-{pre.coursename}({pre.courselevel})
                      </span>
                      <button
                        onClick={() =>
                          handleRemovePrerequisite(selectedCourse.courseid, pre)
                        }
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:ring focus:ring-red-300"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Courseadd;
