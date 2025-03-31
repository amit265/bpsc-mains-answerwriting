"use client";

import { useState } from "react";
import AnswerBox from "./components/AnswerBox";
import Navbar from "./components/Navbar";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [type, setType] = useState("short");
  const [loading, setLoading] = useState(false);

  const generateAnswer = async () => {
    if (!question.trim()) return alert("Please enter a question!");

    setLoading(true);
    setAnswer(null);

    try {
      const response = await fetch("/api/generateAnswer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, type }),
      });

      const data = await response.json();
      if (data.answer) {
        setAnswer(data.answer);
      } else {
        alert("Failed to generate answer. Try again.");
      }
    } catch (error) {
      console.error("Error fetching answer:", error);
      alert("Error generating answer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Navbar />
      <div className="mx-auto max-w-3xl w-full mt-6 bg-white shadow-md p-6 rounded-md">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          BPSC Answer Writing AI
        </h1>

        {/* Question Input */}
        <textarea
          className="w-full mt-4 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          placeholder="Enter your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        {/* Answer Type Selection */}
        <select
          className="w-full mt-2 p-3 border border-gray-300 rounded-md"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="short">Short (100-150 words)</option>
          <option value="long">Long (300-400 words)</option>
          <option value="essay">Essay (700-800 words)</option>
        </select>

        {/* Generate Answer Button */}
        <button
          onClick={generateAnswer}
          className="w-full mt-4 bg-blue-600 text-white font-medium p-3 rounded-md hover:bg-blue-700 transition cursor-pointer"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Answer"}
        </button>
      </div>

      {/* Skeleton Loader */}
      {loading && (
        <div className="max-w-3xl w-full mt-6 bg-white p-6 rounded-md shadow-md mx-auto">
          <div className="animate-pulse">
            <div className="h-5 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded mt-2 w-full"></div>
            <div className="h-4 bg-gray-200 rounded mt-2 w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded mt-2 w-4/5"></div>
          </div>
        </div>
      )}

      {/* Display Answer */}
      {answer && <AnswerBox answer={answer} question={question} type={type} />}
    </div>
  );
}
