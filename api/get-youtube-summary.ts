import type { VercelRequest, VercelResponse } from "@vercel/node";
import { YoutubeTranscript } from "youtube-transcript";
import { OpenAI } from "openai";

// Explicitly set Serverless Function on the Node.js runtime
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
  console.log("Backend: Received request with method:", request.method);

  if (request.method === "POST") {
    try {
      const { videoUrl } = request.body;
      console.log("Backend: Processing video URL:", videoUrl);

      // Get the video ID from the URL
      const videoIdMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
      
      if (!videoIdMatch) {
        console.error("Backend: Invalid YouTube URL format");
        return response.status(400).json({ error: "Invalid YouTube URL" });
      }

      const videoId = videoIdMatch[1];
      console.log("Backend: Extracted video ID:", videoId);

      // Get the transcript from the video
      console.log("Backend: Fetching YouTube transcript...");
      const transcript_list = await YoutubeTranscript.fetchTranscript(videoId);
      console.log("Backend: Successfully retrieved YouTube transcript");

      const transcript = transcript_list
        .map((item) => item["text"])
        .join(" ");
      console.log("Backend: Transcript processed and joined");

      // OpenAI API call
      console.log("Backend: Preparing OpenAI prompt");
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
      const model = "gpt-4o";
      const result = await call_openai_chat_api(prompt, model);
      console.log("Backend: Successfully generated summary");

      response.send({ transcript: result });
    } catch (error) {
      console.error("Backend: Error processing request:", error);
      response.status(500).json({ error: "Internal server error", details: error.message });
    }
  } else {
    console.log("Backend: Rejected non-POST request");
    response.status(405).send("Method not allowed");
  }
}
