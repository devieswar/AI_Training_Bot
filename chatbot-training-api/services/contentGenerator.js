const OpenAI = require('openai');
const axios = require('axios');
const { YoutubeTranscript } = require('youtube-transcript');


require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.getYouTubeVideoEmbedUrl = async (query) => {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    let fullTranscript = '';

    const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 1,
        key: apiKey
      }
    });

    const videoId = res.data.items?.[0]?.id?.videoId;
    if (!videoId) return null;

    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId); // ✅ await here
      fullTranscript = transcript.map(t => t.text).join(' ');
    } catch (err) {
      console.info('YouTube transcript fetch error:', err.message);
    }

    const videoUrl = `https://www.youtube.com/embed/${videoId}`;
    return { videoUrl, fullTranscript };
  } catch (err) {
    console.error('YouTube fetch error:', err.message);
    return null;
  }
};
exports.generateChapters = async (topic, count = 5) => {
  const prompt = `
You are an expert training course designer. Create ${count} well-structured chapter titles for a beginner-level training course on the topic: "${topic}".

Guidelines:
- The chapters should cover the topic progressively, starting with basic concepts and gradually moving toward more advanced ideas.
- Ensure the chapters are relevant, non-repetitive, and provide a logical learning flow.
- Use clear, concise, beginner-friendly language.
- Chapter titles should be engaging and focused on learning outcomes (e.g., "Getting Started with...", "Understanding...", "How to...", "Exploring...", etc.)
- Do not include numbering or bullet points.
- Do not include explanations — just titles.

Return the result strictly as valid JSON in the following format:

{
  "chapters": [
    "Chapter Title 1",
    "Chapter Title 2",
    "Chapter Title 3",
    "Chapter Title 4",
    "Chapter Title 5"
  ]
}

Only return valid JSON — no extra text, markdown, or explanations.
`;


  const chatCompletion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  });

  try {
    const response = JSON.parse(chatCompletion.choices[0].message.content);
    return response.chapters || [];
  } catch (err) {
    console.error(' Failed to parse chapter JSON:', err);
    return [];
  }
};

exports.generateTrainingContent = async (topic, fullTranscript, videoUrl) => {
  const prompt = `
You are an expert AI trainer and content generator. Based on the topic: "${topic}", generate high-quality structured training material.

Use this YouTube transcription as the primary source:\n"${fullTranscript}"

Return **only valid JSON** with this exact structure:

{
  "content": "<2–3 beginner-friendly paragraphs summarizing the topic>",
  "media": {
    "type": "video",
    "url": "https://www.youtube.com/embed/PLACEHOLDER"
  },
  "references": [
    "<REAL official, educational, or well-known URLs only. Do NOT invent links. Scrape from known sources like .edu, .org, wikipedia.org, gov sites, or trusted .com domains such as w3schools, MDN, or official documentation.>"
  ],
  "questions": [
    {
      "type": "mcq",
      "question": "<Beginner-friendly multiple-choice question>",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "<correct option>"
    },
    {
      "type": "truefalse",
      "question": "<Beginner-level True or False question>",
      "options": ["True", "False"],
      "correctAnswer": "<correct option>"
    },
    {
      "type": "mcq",
      "question": "<Another MCQ for the same content>",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "<correct option>"
    },
    {
      "type": "mcq",
      "question": "<Another MCQ>",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "<correct option>"
    },
    {
      "type": "truefalse",
      "question": "<Another True/False question>",
      "options": ["True", "False"],
      "correctAnswer": "<correct option>"
    }
  ]
}

❗Important Guidelines:
- Use content suitable for beginners or learners with no prior exposure to the topic.
- The "references" section should include ONLY **factual, verifiable URLs** to official documentation or educational sites.
- DO NOT make up URLs — choose existing, trusted sources.
- Format the entire response as **pure JSON** using only double quotes (no markdown, no explanations, no commentary).
`;


  const chatCompletion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  });

  const responseText = chatCompletion.choices[0].message.content;

  let jsonData;
  try {
    jsonData = JSON.parse(responseText);
  } catch (err) {
    console.error('❌ JSON parse error:', responseText);
    throw new Error('Invalid JSON format returned from OpenAI');
  }

  // ✅ Inject real video URL into result
  jsonData.media.url = videoUrl;

  return jsonData;
};
