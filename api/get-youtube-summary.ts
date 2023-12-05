import type { VercelRequest, VercelResponse } from "@vercel/node";
import { YoutubeTranscript } from "youtube-transcript";

// Explicitly set Serverless Function on the Node.js runtim
// export const config = {
//   runtime: "nodejs",
// };


export default async function (request: VercelRequest, response: VercelResponse) {
  if (request.method === "POST") {
    const { videoUrl } = request.body;

    // Get the video ID from the URL
    const videoId = String(new URL(videoUrl).searchParams.get('v'));
 
    // Get the transcript from the video
    const transcript_list = await YoutubeTranscript.fetchTranscript(videoId);
    const transcript_text = transcript_list.map(item => item['text']).join(' ');
    console.log(transcript_text);

    console.log("OpenAI API Key: " + process.env.OPENAI_API_KEY);
    response.send({ transcript: "lorem ipsum" });
  } else {
    response.send("Method not allowed");
  }
}


