import type { VercelRequest, VercelResponse } from "@vercel/node";
import { OpenAI } from "openai";

export const config = {
  maxDuration: 60,
};

async function call_openai_chat_api(prompt: string, model = "gpt-4o") {
  console.log("Backend: Initializing OpenAI API call with model:", model);
  try {
    const openai = new OpenAI();
    console.log("Backend: OpenAI client initialized");
    
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
    });
    
    console.log("Backend: Successfully received OpenAI response");
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Backend: OpenAI API call failed:", error);
    throw error;
  }
}

export default async function (
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method === "POST") {
    try {
      const { transcript } = request.body;
      
      const prompt = `
        Your goal is to assist with summarizing YouTube videos. 
        I will provide you with a YouTube video transcription and you will give me a concise summary. Here are your requirements on how you need to summarize:
        1. Identify Key Points: Scan the entire transcription to pinpoint the main ideas or arguments presented in the video.
        2. Organize Information: Arrange these key points logically. For instructional or educational videos, organize them in a step-by-step or chronological order. For other video types, group similar ideas together for coherence.
        3. Summarize Each Point: Distill the essence of what is said about each point in the video, omitting redundant or non-essential information.
        4. Bullet-Point Format: Present the summary in a bullet-point format for easy reading and quick scanning of the main ideas.
        5. Revise for Clarity and Brevity: Review the summary to ensure it is clear, concise, and accurately represents the content of the video.
        Here is the transcript for you to summarize: 
        "${transcript}"
      `;
      
      const result = await call_openai_chat_api(prompt, "gpt-4o");
      response.send({ summary: result });
    } catch (error) {
      console.error("Backend: Error processing request:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      response.status(500).json({ 
        error: "Internal server error", 
        details: errorMessage 
      });
    }
  } else {
    response.status(405).send("Method not allowed");
  }
} 