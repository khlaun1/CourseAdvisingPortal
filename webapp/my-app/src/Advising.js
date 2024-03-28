import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function Advising() {
  const { emailToGo, adminVal } = useParams();
  const [lt, setLastTerm] = useState("");
  const [lgpa, setLastGPA] = useState("");
  const [numRows, setNumRows] = useState(1);
  const [numRowsC, setNumRowsC] = useState(1);
  const [ct, setCurrentTerm] = useState("");
  const [level, setlevel] = useState(0);
  const [levels, setLevels] = useState(new Array(numRows).fill(0));
  const [levelsC, setLevelsC] = useState(new Array(numRowsC).fill(0));

  const [courses, setCourses] = useState([]);
  const [prerequisites, setprerequisites] = useState([]);
  const [filteredPrerequisites, setFilteredPrerequisites] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);

  const [selectedPrereq, setSelectedPrereq] = useState("");
  const [selectedCourses, setSelectedCourses] = useState(
    new Array(numRowsC).fill("")
  );
  const [selectedPrereqs, setSelectedPrereqs] = useState(
    new Array(numRows).fill("")
  ); //newAddition
  const navigate = useNavigate();

  //new addition
  const handleSubmitRows = async (eventObj) => {
    eventObj.preventDefault();
    setNumRows(numRows + 1);
  };

  //new addition
  const handleSubmitRowsC = async (eventObj) => {
    eventObj.preventDefault();
    setNumRowsC(numRowsC + 1);
  };

  const handleChangeLevel = async (event, i) => {
    const newlevel = await event.target.value;
    const newLevels = [...levels];
    newLevels[i] = newlevel;
    setLevels(newLevels);
  };

  const handleChangePrerequisite = async (event, i) => {
    const selectedPrereqNew = await event.target.value;
    const newSelectedPrereqs = [...selectedPrereqs];
    newSelectedPrereqs[i] = selectedPrereqNew;
    setSelectedPrereqs(newSelectedPrereqs);
  };

  useEffect(() => {
    const fetchPre = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/course-fetcher" /*{
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(level),
              }*/
        );
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }

        const data = await response.json();
        //console.log(data);
        setprerequisites(data);
      } catch (err) {
        console.error("fetch error", err);
      }
    };
    //console.log("This is prerequisites", prerequisites);
    fetchPre();
    //console.log(level);

    //console.log("filtered prerequisites", filteredPrerequisites);
  }, [levels]);

  useEffect(() => {
    const newFilteredPrerequisites = Array.from({ length: numRows }, (_, i) => {
      const upperLimit = parseInt(levels[i]) + 99;
      const newFilteredPrerequisites = prerequisites.filter(
        (prerequisite) =>
          parseInt(prerequisite.courselevel, 10) >= levels[i] &&
          parseInt(prerequisite.courselevel, 10) <= upperLimit
      );
      return newFilteredPrerequisites;
    });
    setFilteredPrerequisites(newFilteredPrerequisites);
  }, [levels, prerequisites]);

  //starting the courseplan

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const detailresponse = await fetch(
          "http://localhost:3000/api/detail-fetch"
        );
        const data = await detailresponse.json();
        setCourses(data);
      } catch (err) {
        console.error("Error fetching", err);
      }
    };
    fetchCourseDetail();
  }, [levelsC]);

  //filtering
  useEffect(() => {
    const newFilteredCourses = Array.from({ length: numRowsC }, (_, i) => {
      const upperLimitC = parseInt(levelsC[i]) + 99;
      const newFilteredCourses = courses.filter(
        (course) =>
          parseInt(course.courselevel, 10) >= levelsC[i] &&
          parseInt(course.courselevel, 10) <= upperLimitC
      );
      return newFilteredCourses;
    });
    setFilteredCourses(newFilteredCourses);
  }, [levelsC, courses]);

  const handleChangeLevelC = async (event, i) => {
    const newlevelC = await event.target.value;
    const newLevelsC = [...levelsC];
    newLevelsC[i] = newlevelC;
    setLevelsC(newLevelsC);
  };

  const handleChangeCourse = async (event, i) => {
    const selectedCourseNew = await event.target.value;
    const newSelectedCourses = [...selectedCourses];
    newSelectedCourses[i] = selectedCourseNew;
    setSelectedCourses(newSelectedCourses);
  };

  const handleSubmit = async (eventObj) => {
    eventObj.preventDefault();
    if (selectedCourses[0].length === 0 || selectedPrereqs[0].length === 0) {
      alert("No courses selected or prerequisites selected");
      return;
    }

    const formSubmissionResponse = await fetch(
      "http://localhost:3000/api/course-advising",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailToGo,
          lt,
          lgpa,
          ct,
          selectedPrereqs,
          selectedCourses,
        }),
      }
    );
    const responseData = await formSubmissionResponse.json();
    if (formSubmissionResponse.ok) {
      alert("Your Advising Request form was submitted successfully");
      navigate(`/profile/${emailToGo}/${adminVal}`);
    } else {
      alert(responseData.message);
    }
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
      <div className="w-full max-w-md mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Header Section</h2>
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              htmlFor="Last-term"
            >
              Last Term
            </label>
            <div className="flex items-center border rounded-lg shadow-sm overflow-hidden">
              <span className="pl-3">
                <i className="fas fa-envelope text-gray-500"></i>
              </span>
              <input
                className="w-full px-4 py-3 focus:outline-none transition duration-200"
                id="Last-term"
                type="Last-term"
                placeholder="Enter your last term(please enter spring, fall or summer)"
                value={lt}
                onChange={(e) => setLastTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              htmlFor="lastGPA"
            >
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
                placeholder="Enter your last GPA(Just the number e.g. 2.20)"
                value={lgpa}
                onChange={(e) => setLastGPA(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-semibold mb-2"
              htmlFor="currentterm"
            >
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
          </div>
          <h2 className="text-xl font-semibold mb-4">Pre-Requisite Section</h2>
          {Array.from({ length: numRows }, (_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="w-1/2">
                <label
                  htmlFor={`level-${i}`}
                  className="block text-gray-700 font-bold mb-2"
                >
                  Select Level
                </label>
                <select
                  id={`level-${i}`}
                  value={levels[i]}
                  onChange={(event) => handleChangeLevel(event, i)}
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                >
                  <option value={0}>Select an option</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={300}>300</option>
                  <option value={400}>400</option>
                </select>
              </div>
              <div className="w-1/2">
                <label
                  htmlFor={`prerequisite-${i}`}
                  className="block text-gray-700 font-bold mb-2"
                >
                  Select Prerequisite
                </label>
                <select
                  id={`prerequisite-${i}`}
                  value={selectedPrereqs[i]}
                  onChange={(event) => handleChangePrerequisite(event, i)}
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                >
                  <option value="">Select Prerequisite</option>
                  {filteredPrerequisites[i] &&
                    filteredPrerequisites[i].map((prerequisite) => (
                      <option
                        key={`${prerequisite.courseid}-${i}`}
                        value={prerequisite.courseid}
                      >
                        {prerequisite.coursename} ({prerequisite.courselevel})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          ))}
          <div>
            <button
              type="button"
              onClick={handleSubmitRows}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Add Row
            </button>
          </div>
          <h2 className="text-xl font-semibold mb-4">Course Plan Section</h2>
          {Array.from({ length: numRowsC }, (_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="w-1/2">
                <label
                  htmlFor={`levelC-${i}`}
                  className="block text-gray-700 font-bold mb-2"
                >
                  Select Level
                </label>
                <select
                  id={`levelC-${i}`}
                  value={levelsC[i]}
                  onChange={(event) => handleChangeLevelC(event, i)}
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                >
                  <option value={0}>Select a Level</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={300}>300</option>
                  <option value={400}>400</option>
                </select>
              </div>
              <div className="w-1/2">
                <label
                  htmlFor={`course-${i}`}
                  className="block text-gray-700 font-bold mb-2"
                >
                  Select Course
                </label>
                <select
                  id={`course-${i}`}
                  value={selectedCourses[i]}
                  onChange={(event) => handleChangeCourse(event, i)}
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                >
                  <option value="">Select Course</option>
                  {filteredCourses[i] &&
                    filteredCourses[i].map((course) => (
                      <option
                        key={`${course.courseid}-${i}`}
                        value={course.courseid}
                      >
                        {course.coursename} ({course.courselevel})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          ))}
          <div>
            <button
              type="button"
              onClick={handleSubmitRowsC}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Add Row
            </button>
          </div>
          <div>
            <button
              type="submit"
              className="bg-red-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded shadow-md transition-all duration-200"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Advising;
