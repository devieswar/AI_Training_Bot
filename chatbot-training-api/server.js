const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const {
  generateTrainingContent,
  getYouTubeVideoEmbedUrl,
  generateChapters
} = require('./services/contentGenerator');


const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api/generate-chapters', async (req, res) => {
  const { topic, count } = req.body;

  try {
    const chapters = await generateChapters(topic, count || 5);
    const results = [];

    for (const chapterTitle of chapters) {
      const { videoUrl, fullTranscript } = await getYouTubeVideoEmbedUrl(chapterTitle);
      const data = await generateTrainingContent(chapterTitle, fullTranscript, videoUrl);
      results.push({ chapterTitle, ...data });
    }

    res.json({ topic, chapters: results });
  } catch (err) {
    console.error(' Failed to generate full chapter set:', err);
    res.status(500).json({ error: 'Could not generate chapter content.' });
  }
});


app.post('/api/generate-training', async (req, res) => {
  const { prompt } = req.body;

  try {
    const result = await getYouTubeVideoEmbedUrl(prompt);

    if (!result || !result.videoUrl) {
      return res.status(404).json({ error: 'No video found for this topic.' });
    }

    const data = await generateTrainingContent(
      prompt,
      result.fullTranscript,
      result.videoUrl
    );

    res.json(data);
  } catch (err) {
    console.error('❌ Generation error:', err);
    res.status(500).json({ error: 'Failed to generate training content.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
