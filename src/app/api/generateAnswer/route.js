import { ESSAY_PROMPT } from "@/app/utils/prompts/essay";
import { LONG_ANSWER_PROMPT } from "@/app/utils/prompts/long";
import { SHORT_ANSWER_PROMPT } from "@/app/utils/prompts/short";

import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

const openai_api_key = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const deepseek_api_key = process.env.DEEPSEEK_API_KEY || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;


const withTimeout = (promise, timeoutMs = 120000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("⏳ Timeout: External API did not respond in time")), timeoutMs)
    ),
  ]);

export async function POST(req) {
  console.log("✅ Received API Request");

  try {
    const body = await req.json();
    const { question, language, type, api, ai } = body;
    console.log("📥 Request Body:", body);

    // Input validation
    if (!question || !type || !language || !api || !ai) {
      console.warn("❌ Missing parameters in request");
      return new Response(JSON.stringify({ error: "Missing question, type, language, api, or ai" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Select prompt
    const prompt =
      type === "short"
        ? SHORT_ANSWER_PROMPT
        : type === "long"
        ? LONG_ANSWER_PROMPT
        : ESSAY_PROMPT;

    const finalPrompt = `${prompt.replace("{question}", question)}\n\nPlease provide the response in ${language}.`;

    let text = "";

    if (ai === "gemini") {
      const genAI = new GoogleGenerativeAI(api);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      console.log("📤 Sending request to Gemini...");
      const result = await withTimeout(
        model.generateContent({
          contents: [
            {
              role: "user",
              parts: [{ text: finalPrompt }],
            },
          ],
        })
      );

      text = await result.response.text();
    }

    else if (ai === "openai") {
      const openai = new OpenAI({ apiKey: openai_api_key });

      console.log("📤 Sending request to OpenAI...");
      const response = await withTimeout(
        openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: finalPrompt }],
          temperature: 0.7,
        })
      );

      text = response.choices[0].message.content;
    }

    else if (ai === "deepseek") {
      const openai = new OpenAI({
        apiKey: deepseek_api_key,
        baseURL: "https://api.deepseek.com",
      });

      console.log("📤 Sending request to DeepSeek...");
      const response = await withTimeout(
        openai.chat.completions.create({
          model: "deepseek-chat",
          messages: [{ role: "user", content: finalPrompt }],
        })
      );

      text = response.choices[0].message.content;
    }

    else {
      return new Response(JSON.stringify({ error: "❌ Invalid AI provider specified" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("✅ Answer generated successfully");

    return new Response(JSON.stringify({ answer: text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Error Generating Answer:", error?.message || error);

    return new Response(
      JSON.stringify({ error: error?.message || "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
