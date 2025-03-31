import { ESSAY_PROMPT } from "@/app/utils/prompts/essay";
import { LONG_ANSWER_PROMPT } from "@/app/utils/prompts/long";
import { SHORT_ANSWER_PROMPT } from "@/app/utils/prompts/short";
import { GoogleGenerativeAI } from "@google/generative-ai";

// console.log(process.env.GEMINI_API_KEY_A);

export async function POST(req) {
  console.log("✅ Received API Request");

  try {
    const body = await req.json();
    // console.log("📥 Request Body:", body);

    const { question, language, type, api } = body;
    // console.log("body", body);
    // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_A);

    // console.log("api from body request ", api);
    
    const genAI = new GoogleGenerativeAI(api);

    if (!question || !type || !language) {
      console.log("❌ Missing question or type in request!");
      return new Response(
        JSON.stringify({ error: "Missing question or type" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ Processing request...");

    // Determine word limit based on answer type
    const prompt =
      type === "short"
        ? SHORT_ANSWER_PROMPT
        : type === "long"
        ? LONG_ANSWER_PROMPT
        : ESSAY_PROMPT;

    const finalPrompt = `${prompt.replace(
      "{question}",
      question
    )}\n\nPlease provide the response in ${language}.`;

    // console.log("final Prompt", finalPrompt);
    

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    console.log("📤 Sending request to Gemini API...");

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: finalPrompt }],
        },
      ],
    });
    // console.log("✅ Gemini API response received:", result);

    const response = await result.response;
    const text = response.text();
    console.log("📄 Generated Answer:", text);

    return new Response(JSON.stringify({ answer: text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate answer" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
