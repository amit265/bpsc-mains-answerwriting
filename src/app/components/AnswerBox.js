import { useState } from "react";
import { db } from "../utils/firebaseConfig";
import { doc, setDoc, serverTimestamp, addDoc, collection, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid"; // Import UUID for unique IDs

const AnswerBox = ({ answer, loading, question, type }) => {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);



  // Function to copy answer to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Function to save answer in Firestore with a unique ID
  const handleSave = async () => {
    if (!answer || !question || !type) {
      toast.error("Missing data! Ensure all fields are filled.");
      return;
    }
  
    setSaving(true);
    const uniqueId = uuidv4();
    const docRef = doc(db, "answers", type + " : "+ question);
  
    console.log("🟡 Attempting to save document with ID:", uniqueId);
  
    try {
      await setDoc(docRef, {
        id: uniqueId,
        question,
        answer,
        type,
        createdAt: new Date(),  // 🔥 Replace serverTimestamp() for debugging
      });
  
      console.log("✅ Document successfully written with ID:", uniqueId);
      toast.success("Answer saved successfully! ✅");
    } catch (error) {
      console.error("❌ Firestore Write Error:", error.code, error.message);
      toast.error(`Firestore Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };
  
  

  return (
    <div className="mx-auto mt-6 p-4 border rounded-lg shadow bg-white max-w-7/12">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        {loading ? "Generating Answer..." : "Generated Answer:"}
      </h2>

      {loading ? (
        <div className="animate-pulse mx-auto">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        </div>
      ) : (
        answer && (
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {answer}
          </div>
        )
      )}

      {!loading && answer && (
        <div className="mt-4 flex gap-3">
          <button
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
            onClick={handleCopy}
          >
            {copied ? "Copied! ✅" : "Copy Answer 📋"}
          </button>

          <button
            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving... ⏳" : "Save Answer 💾"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AnswerBox;
