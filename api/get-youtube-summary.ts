import type { VercelRequest, VercelResponse } from "@vercel/node";
import { YoutubeTranscript } from "youtube-transcript";
import { OpenAI } from "openai";

// Explicitly set Serverless Function on the Node.js runtime
export const config = {
  maxDuration: 60, 
};

async function call_openai_chat_api(prompt: string, model = "gpt-4o") {
  console.log("Calling OpenAI Chat API...");
  const openai = new OpenAI();
  const response = await openai.chat.completions.create({
    model: model,
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: prompt },
    ],
  });
  console.log("Got response");
  return response.choices[0].message.content;
}

export default async function (
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method === "POST") {
    const { videoUrl } = request.body;

    // Get the video ID from the URL
    const videoId = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i)[1];

    // Get the transcript from the video
    const transcript_list = await YoutubeTranscript.fetchTranscript(videoId);
    const transcript = transcript_list
      .map((item) => item["text"])
      .join(" ");
    console.log("\n\ngot transcript");

    // OpenAI API call
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

    console.log("\n\nCalling gpt-4-turbo");
    const model = "gpt-4-1106-preview";
    const result = await call_openai_chat_api(prompt, model);

    response.send({ transcript: result });
  } else {
    response.send("Method not allowed");
  }
}
