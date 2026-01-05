const express = require('express');
const { Anthropic } = require('@anthropic-ai/sdk');

const router = express.Router();

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

router.post('/complete', async (req, res) => {
  try {
    const { prompt, maxTokens = 700 } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const enforcedMaxTokens = Math.min(maxTokens, 1000);

    console.log(`🤖 Claude request: maxTokens=${enforcedMaxTokens}`);

    const message = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: enforcedMaxTokens,
      messages: [{
        role: 'user',
        content: prompt
      }],
    });

    const response = message.content[0]?.text || '';

    console.log(`✅ Claude response: ${response.length} chars`);

    res.json({
      success: true,
      response,
      usage: message.usage,
      model: message.model
    });

  } catch (error) {
    console.error('❌ Claude error:', error.message);

    res.status(500).json({
      error: 'AI service error',
      details: error.message
    });
  }
});

module.exports = router;
