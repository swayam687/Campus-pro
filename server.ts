import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// Explain topic endpoint with High Thinking Level
app.post('/api/ai/explain-topic', async (req: Request, res: Response) => {
  const { topic, subject, notes, classTime } = req.body;

  if (!topic) {
    res.status(400).json({ error: 'Topic is required' });
    return;
  }

  if (!ai) {
    // Offline/Fallback structured response if no API key is provided
    res.json({
      summary: `Here is a structured revision outline for ${topic} in ${subject || 'your subject'}.`,
      simpleAnalogy: `Think of ${topic} as a foundational building block in ${subject || 'this course'}. Revisit your lecture notes and break the concept into input, process, and output.`,
      keyPoints: [
        `Definition and core purpose of ${topic}`,
        `Step-by-step workflow and standard formulas or rules`,
        `Difference between standard application and edge cases`,
        `Common exam traps and misconceptions to avoid`,
      ],
      stepByStep: `1. Re-read the lecture slide on ${topic}.\n2. Write a 2-sentence summary in your own words without looking.\n3. Solve 1 sample textbook problem or write a minimal code snippet.\n4. Verify your solution against class examples.`,
      activeRecallQuestions: [
        {
          question: `What is the core principle behind ${topic}?`,
          answer: `Explain the fundamental definition and why professors focus on it during exams.`,
        },
        {
          question: `Can you solve a basic textbook scenario of ${topic}?`,
          answer: `Apply the step-by-step method learned in class.`,
        },
        {
          question: `What is the most frequent mistake students make in ${topic}?`,
          answer: `Forgetting boundary conditions or confusing similar terminology.`,
        },
      ],
      isAiGenerated: false,
      message: 'Running in offline revision mode. Set GEMINI_API_KEY for real-time AI deep explanations.',
    });
    return;
  }

  try {
    const prompt = `You are an expert college tutor helping a university student who just finished a class and logged a topic they did not understand.
Subject: ${subject || 'General College Subject'}
Topic Not Understood: ${topic}
Additional context/notes from class: ${notes || 'None provided'}
Class period: ${classTime || 'Today'}

Break down this topic clearly and concisely so that when the student arrives home, they can master it in 15-20 minutes.
Return a valid JSON object with the following schema:
{
  "summary": "Crisp 2-sentence summary of the topic and why it matters",
  "simpleAnalogy": "An intuitive, real-world analogy (ELI5 style) that makes the concept click instantly",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3", "Key point 4"],
  "stepByStep": "Clear numbered step-by-step explanation or walkthrough of the mechanism/method",
  "commonPitfalls": ["Common mistake 1 students make", "Common mistake 2"],
  "activeRecallQuestions": [
    {"question": "Active recall self-test question 1", "answer": "Clear, concise answer to question 1"},
    {"question": "Active recall self-test question 2", "answer": "Clear, concise answer to question 2"},
    {"question": "Active recall self-test question 3", "answer": "Clear, concise answer to question 3"}
  ],
  "quickActionPlan": "Actionable 15-minute home revision checklist"
}`;

    // Use ThinkingLevel.HIGH as mandated in guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    const text = response.text?.trim() || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch {
      parsedData = {
        summary: text,
        simpleAnalogy: 'Break down the concept into smaller sub-steps.',
        keyPoints: ['Review class definitions', 'Work through sample questions'],
        stepByStep: text,
        activeRecallQuestions: [],
      };
    }

    res.json({
      ...parsedData,
      isAiGenerated: true,
    });
  } catch (error: any) {
    console.error('Error generating topic explanation:', error);
    res.status(500).json({
      error: 'Failed to generate explanation',
      details: error.message,
    });
  }
});

// Break down homework/assignment into actionable steps
app.post('/api/ai/homework-plan', async (req: Request, res: Response) => {
  const { title, subject, deadline, type } = req.body;

  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  if (!ai) {
    res.json({
      plan: [
        'Review the assignment prompt and gather all textbook/lecture materials.',
        'Outline or draft the core solution/code/report.',
        'Double-check against requirements and submit before the deadline.',
      ],
      estimatedMinutes: 45,
      isAiGenerated: false,
    });
    return;
  }

  try {
    const prompt = `A college student logged a ${type || 'homework'} for "${subject || 'General'}": "${title}" with deadline "${deadline || 'Soon'}".
Provide a rapid 3-step action plan to tackle this assignment tonight without stress.
Return JSON:
{
  "plan": ["Step 1 description", "Step 2 description", "Step 3 description"],
  "estimatedMinutes": 45,
  "proTip": "A smart practical tip to complete this efficiently"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);
    res.json({ ...parsed, isAiGenerated: true });
  } catch (err: any) {
    res.json({
      plan: [
        'Review requirements and lecture slides',
        'Draft the main answers or exercises',
        'Proofread and submit ahead of time',
      ],
      estimatedMinutes: 30,
      isAiGenerated: false,
    });
  }
});

// Vite middleware in dev or static files in prod
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
