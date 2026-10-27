const client = require("../../config/aiClient");
async function generateContent(prompt) {
  const response = await client.chat.completions.create({
    model: "llama-3.1-8b",
    messages: [
      {
        role: "system",
        content: "You are an expert social media content creator. Generate engaging, natural, human-like content tailored to the target platform, audience, and brand voice. Create compelling hooks, creative captions, relevant hashtags, and clear calls to action. Adapt tone and style to platforms like Instagram, Youtube, Facebook, LinkedIn, and X. Avoid generic phrases, unnecessary filler, excessive emojis, and unsupported claims. Return concise, polished, ready-to-publish content in the requested format.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.choices[0].message.content;
}

module.exports = generateContent;