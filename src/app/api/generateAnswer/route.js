import { ESSAY_PROMPT } from "@/app/utils/prompts/essay";
import { LONG_ANSWER_PROMPT } from "@/app/utils/prompts/long";
import { SHORT_ANSWER_PROMPT } from "@/app/utils/prompts/short";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

const openai_api_key =
  process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const deepseek_api_key =
  process.env.DEEPSEEK_API_KEY || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
const groq_api_key =
  process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;

const withTimeout = (promise, timeoutMs = 120000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(new Error("⏳ Timeout: External API did not respond in time")),
        timeoutMs
      )
    ),
  ]);

const getPromptByType = (type) => {
  switch (type) {
    case "short":
      return SHORT_ANSWER_PROMPT;
    case "long":
      return LONG_ANSWER_PROMPT;
    case "essay":
    default:
      return ESSAY_PROMPT;
  }
};

const defaultSystemMessage =
  "You are an expert in BPSC Mains answer writing. You write structured, high-quality answers like a well-prepared civil services candidate.";

const makeGroqRequest = async (model, prompt) => {
  const res = await withTimeout(
    fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groq_api_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: defaultSystemMessage },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1200,
      }),
    })
  );

  const data = await res.json();
  console.log("🧾 Groq API Raw Response:", data);

  if (!data.choices?.length) {
    throw new Error(`❌ No response from Groq. ${JSON.stringify(data)}`);
  }

  return data.choices[0].message.content;
};

export async function POST(req) {
  console.log("✅ Received API Request");

  try {
    const body = await req.json();
    const { question, language, type, ai, api } = body;
    console.log("📥 Request Body:", body);

    if (!question || !type || !language || !api || !ai) {
      return new Response(
        JSON.stringify({
          error: "Missing question, type, language, api, or ai",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const promptTemplate = getPromptByType(type);
    const finalPrompt = `${promptTemplate.replace(
      "{question}",
      question
    )}\n\nPlease provide the response in ${language}.`;

    let text = "";

    switch (ai) {
      case "gemini": {
        const genAI = new GoogleGenerativeAI(api);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        console.log("📤 Sending request to Gemini...");
        const result = await withTimeout(
          model.generateContent({
            contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
          })
        );
        text = await result.response.text();
        break;
      }

      case "openai": {
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
        break;
      }

      case "llama":
        text = await makeGroqRequest("llama-3.3-70b-versatile", finalPrompt);
        break;

      case "deepseek":
        text = await makeGroqRequest(
          "deepseek-r1-distill-qwen-32b",
          finalPrompt
        );
        break;

      default:
        return new Response(
          JSON.stringify({ error: "❌ Invalid AI provider specified" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
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
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
