import type { VercelRequest, VercelResponse } from "@vercel/node";
import { YoutubeTranscript } from "youtube-transcript";

export const config = {
  maxDuration: 60,
};

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
      let transcript_list;
      try {
        transcript_list = await YoutubeTranscript.fetchTranscript(videoId);
        console.log("Backend: Successfully retrieved YouTube transcript (Method: youtube-transcript)");
      } catch (transcriptError) {
        console.error("Backend: Transcript fetch error:", transcriptError);
        if (transcriptError instanceof Error && transcriptError.message.includes('Transcript is disabled')) {
          return response.status(400).json({ 
            error: "Transcript Unavailable", 
            message: "This video does not have available transcripts. Please try a different video or ensure closed captions are enabled."
          });
        }
        throw transcriptError;
      }

      const transcript = transcript_list
        .map((item) => item["text"])
        .join(" ");

      response.send({ transcript });
    } catch (error) {
      console.error("Backend: Error processing request:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      response.status(500).json({ 
        error: "Internal server error", 
        details: errorMessage 
      });
    }
  } else {
    console.log("Backend: Rejected non-POST request");
    response.status(405).send("Method not allowed");
  }
} 