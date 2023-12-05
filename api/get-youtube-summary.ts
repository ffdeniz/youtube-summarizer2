import type { VercelRequest, VercelResponse } from "@vercel/node";
import { YoutubeTranscript } from 'youtube-transcript';

// Explicitly set Serverless Function on the Node.js runtim
// export const config = {
//   runtime: "nodejs",
// };

export default function (request: VercelRequest, response: VercelResponse) {
  if (request.method === 'POST') {
    const { videoUrl } = request.body;
    console.log(videoUrl);
    response.send({ transcript: "lorem ipsum" });
  } else {
    response.send('Method not allowed');
  }
}