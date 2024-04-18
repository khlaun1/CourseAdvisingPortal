import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [quesUpdated, setQuesUpdated] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const { emailToGo, adminVal } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      const response = await fetch("http://localhost:3000/questions");
      const data = await response.json();
      //console.log("This is the data", data);
      if (!response.ok) {
        alert("There are not questions rightnow");
      } else {
        setQuestions(data);
      }
    };

    fetchQuestions();
  }, [quesUpdated]);

  useEffect(() => {
    console.log("this is the questions ", questions);
  }, [questions]);

  const handleSubmitNewQuestion = async (eventObj) => {
    eventObj.preventDefault();
    const userInput = prompt("Enter your question:");
    if (userInput !== null && userInput.trim() !== "") {
      const quesResponse = await fetch("http://localhost:3000/question-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailToGo, userInput }),
      });
      if (quesResponse.ok) {
        setQuesUpdated(true);
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
      <h1 className="text-xl font-bold text-black">Discussions</h1>

      <div className="flex-grow container mx-auto px-4 md:p-6">
        <button
          onClick={handleSubmitNewQuestion}
          className="bg-green-500 hover:bg-green-200 text-black font-bold py-2 px-4 rounded"
        >
          New Question
        </button>
        <ul className="list-disc pl-5">
          {questions.map((question) => (
            <li
              key={question.questionid}
              className="py-2 border-b border-gray-300 hover:bg-gray-200"
            >
              <Link
                to={`/profile/questions/${emailToGo}/${adminVal}/${question.questionid}/${question.questions}`}
                className="text-blue-600 hover:underline"
              >
                {question.questions}{" "}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default QuestionsPage;
