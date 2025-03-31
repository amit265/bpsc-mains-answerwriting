import { ESSAY_PROMPT } from "@/app/utils/prompts/essay";
import { LONG_ANSWER_PROMPT } from "@/app/utils/prompts/long";
import { SHORT_ANSWER_PROMPT } from "@/app/utils/prompts/short";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
const openai_api_key = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
console.log(openai_api_key);

export async function POST(req) {
  console.log("✅ Received API Request");

  try {
    const body = await req.json();
    // console.log("📥 Request Body:", body);

    const { question, language, type, api, ai } = body;
    console.log("body", body);
    // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_A);

    // console.log("api from body request ", api);

    if (!question || !type || !language || !api || !ai) {
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

    let text = "";

    // console.log("final Prompt", finalPrompt);

    if (ai === "gemini") {
      const genAI = new GoogleGenerativeAI(api);

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
      text = await result.response.text();
    } else if (ai === "openai") {
      const openai = new OpenAI({ apiKey: openai_api_key });
      console.log("📤 Sending request to OpenAI API...");
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: finalPrompt }],
        temperature: 0.7,
      });
      // GPT-4-turbo 

      text = response.choices[0].message.content;
    } else {
      return new Response(JSON.stringify({ error: "Invalid API provider" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

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
