import type { VercelRequest, VercelResponse } from "@vercel/node";

// Explicitly set Serverless Function on the Node.js runtim
// export const config = {
//   runtime: "nodejs",
// };

 
export default function (request: VercelRequest, response: VercelResponse) {
  const { name = 'World' } = request.query;
  response.send(`Hello ${name}!`);
}