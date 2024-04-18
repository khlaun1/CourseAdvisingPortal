import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

function Answers() {
  const [answersData, setAnswersData] = useState([]);
  const [questionData, setQuestionData] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [username, setUsername] = useState("");
  const { emailToGo, adminVal, questionId, question } = useParams();
  const [updated, setupdated] = useState(false);
  const navigate = useNavigate();

  //sends questionid and expects to fetch answers along with username who answered it
  useEffect(() => {
    const fetchAnswers = async () => {
      const response = await fetch("http://localhost:3000/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      });
      const data = await response.json();
      if (response.ok) {
        setAnswersData(data);
      } else {
        alert(data.message);
      }
    };
    fetchAnswers();
  }, [updated]);

  //sends questionid and expects to fetch username for the userid who asked that question
  useEffect(() => {
    const fetchQuestionData = async () => {
      const quesResponse = await fetch("http://localhost:3000/get-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      });
      console.log(quesResponse);
      const quesData = await quesResponse.text();
      console.log("This is my quesData", quesData);
      if (quesResponse.ok) {
        setUsername(quesData);
      } else {
        alert(quesData.message);
      }
    };
    fetchQuestionData();
  }, []);

  //sends questionId and answer and expects the route handler to get the userid and insert quesid, userid and answer
  const handleSubmitNewAnswer = async (eventObj) => {
    eventObj.preventDefault();
    const userInput = prompt("Enter your Answer:");
    if (userInput !== null && userInput.trim() !== "") {
      const ansResponse = await fetch("http://localhost:3000/answer-insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailToGo, adminVal, questionId, userInput }),
      });
      if (ansResponse.ok) {
        setupdated(true);
        alert("You replied to this question");
      } else {
        alert("error inserting data");
      }
    }
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
      <div className="container mx-auto p-4">
        <div className="bg-white shadow-lg rounded px-8 pt-6 pb-8 mb-4">
          <h1 className="text-2xl font-bold mb-2">Question</h1>
          <p className="mb-4">{question}</p>
          <p className="text-gray-700 text-base mb-4">
            <b>Asked by:</b> {username}
          </p>
        </div>
        <div className="flex justify-end mb-4">
          <button
            onClick={handleSubmitNewAnswer}
            className="bg-green-500 hover:bg-green-200 text-black font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            Reply
          </button>
        </div>
        <div className="bg-white shadow-lg rounded px-8 pt-6 pb-8">
          <h2 className="text-xl font-bold mb-2">Answers</h2>
          {answersData.map((item, index) => (
            <div key={index} className="mb-4">
              <p className="text-gray-700 text-base">{item.answer}</p>
              <p className="text-gray-600 text-sm">
                <b>Answered by:</b> {item.username}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Answers;
