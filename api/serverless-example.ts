import type { VercelRequest, VercelResponse } from "@vercel/node";

// Explicitly set Serverless Function on the Node.js runtim
// export const config = {
//   runtime: "nodejs",
// };

export default function (request: VercelRequest, response: VercelResponse) {
  if (request.method === 'POST') {
    const { count } = request.body;
    const newCount = count + 5;
    response.send({ count: newCount });
  } else {
    response.send('Method not allowed');
  }
}