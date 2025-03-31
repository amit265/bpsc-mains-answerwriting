"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import Navbar from "../../components/Navbar";
import { db } from "@/app/utils/firebaseConfig";

export default function ShortAnswers() {
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null); // Track selected question

  useEffect(() => {
    const fetchAnswers = async () => {
      setLoading(true);
      setError(null);

      try {
        const q = query(collection(db, "answers"), where("type", "==", "short"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setAnswers([]);
        } else {
          setAnswers(
            querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        }
      } catch (err) {
        console.error("Error fetching answers:", err);
        setError("Failed to load answers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnswers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Navbar />
      <h1 className="text-2xl font-bold text-center">Saved Essays</h1>

      <div className="max-w-2xl mx-auto mt-6">
        {loading && <p className="text-center text-blue-500">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {/* If an answer is selected, show only that answer */}
        {selectedAnswer ? (
          <div className="bg-white p-6 rounded-md shadow-md">
            <button
              onClick={() => setSelectedAnswer(null)}
              className="mb-4 text-blue-600 hover:underline"
            >
               ⬅ Back
            </button>
            <h2 className="text-xl font-semibold text-gray-800">{selectedAnswer.question}</h2>
            <p className="mt-4 text-gray-700 whitespace-pre-wrap break-words">
              {selectedAnswer.answer}
            </p>
          </div>
        ) : (
          // Show list of questions
          answers.length === 0 ? (
            <p className="text-center text-gray-600">No saved essays yet.</p>
          ) : (
            answers.map((ans) => (
              <div
                key={ans.id}
                onClick={() => setSelectedAnswer(ans)}
                className="bg-white p-4 rounded-md shadow mb-4 cursor-pointer hover:bg-gray-50"
              >
                <h2 className="font-semibold text-lg text-gray-800">{ans.question}</h2>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
