const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const DEFAULT_MODELS = [
  process.env.ANTHROPIC_MODEL,
  'claude-sonnet-4-0',
  'claude-sonnet-4-20250514',
  'claude-3-7-sonnet-latest',
  'claude-3-7-sonnet-20250219',
  'claude-3-5-sonnet-latest',
  'claude-3-5-sonnet-20241022',
  'claude-3-5-haiku-latest',
  'claude-3-5-haiku-20241022',
  'claude-3-haiku-20240307',
].filter(Boolean);

async function createMessageWithFallback(payload) {
  let lastError;

  for (const model of DEFAULT_MODELS) {
    try {
      return await client.messages.create({
        model,
        ...payload,
      });
    } catch (error) {
      lastError = error;

      const message = String(error?.message || '');
      const isModelError =
        message.includes('not_found_error') ||
        message.includes('model:') ||
        message.toLowerCase().includes('model');

      if (!isModelError) {
        throw error;
      }
    }
  }

  throw lastError;
}

// Parse syllabus text into module/topic structure
async function parseSyllabus(rawText) {
  const response = await createMessageWithFallback({
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `You are a syllabus parser. Parse the following syllabus text into a structured JSON format.
      
Rules:
- Identify modules/units (usually labeled "Module 1", "Unit I", etc.)
- Under each module, list individual topics. Each topic should be atomic (one concept).
- Expand bracketed subtopics into separate topic items.
- Return ONLY valid JSON, no explanation.

Format:
{
  "modules": [
    {
      "module_no": 1,
      "title": "Module title",
      "topics": ["Topic 1", "Topic 2", "Topic 3"]
    }
  ]
}

Syllabus text:
${rawText}`,
    }],
  });
  
  const text = response.content[0].text;
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

// OCR attendance sheet image → list of reg nos present/absent
async function parseAttendanceSheet(base64Image, studentList) {
  const response = await createMessageWithFallback({
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: 'image/jpeg', data: base64Image },
        },
        {
          type: 'text',
          text: `This is a physical attendance sheet. Extract all student registration numbers or names that are marked as present.
          
Available students in this class: ${JSON.stringify(studentList)}

Return ONLY valid JSON:
{
  "present_reg_nos": ["REG001", "REG002"],
  "absent_reg_nos": ["REG003"],
  "confidence": "high/medium/low",
  "notes": "any ambiguities"
}`,
        },
      ],
    }],
  });
  
  const text = response.content[0].text;
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

// Match study materials to syllabus topics
async function matchMaterialToTopics(materialTitle, topics) {
  const response = await createMessageWithFallback({
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Given this study material title: "${materialTitle}"
      
And these syllabus topics:
${topics.map((t, i) => `${i}: ${t}`).join('\n')}

Which topic indices does this material most relate to? Return ONLY JSON:
{"matched_indices": [0, 2], "confidence": "high"}`,
    }],
  });
  
  const text = response.content[0].text;
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

module.exports = { parseSyllabus, parseAttendanceSheet, matchMaterialToTopics };
