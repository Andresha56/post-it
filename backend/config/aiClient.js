const OpenAI = require("openai");
const client = new OpenAI({
  apiKey: `sk-${process.env.BOOKMYHOST_API_KEY}`,
  baseURL: "https://api.bookmyhost.com/v1",
});

module.exports = client;
