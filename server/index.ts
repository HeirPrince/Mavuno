import express from 'express';
import path from 'path';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import type { AuditMetrics } from '../src/lib/types';

dotenv.config({ path: '.env.local' });
dotenv.config();

function resolveClerkPublishableKeyFromEnv(): string | undefined {
  for (const key of [
    process.env.VITE_CLERK_PUBLISHABLE_KEY,
    process.env.VITE_PUBLIC_CLERK_PUBLISHABLE_KEY,
    process.env.CLERK_PUBLISHABLE_KEY,
  ]) {
    const trimmed = key?.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
}

function buildRuntimeConfigScript(): string {
  const config = {
    VITE_CLERK_PUBLISHABLE_KEY: resolveClerkPublishableKeyFromEnv() ?? '',
  };
  return `<script>window.__MAVUNO_RUNTIME_CONFIG__=${JSON.stringify(config)}</script>`;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3001;

const app = express();
app.use(express.json({ limit: '32kb' }));

app.post('/api/ai/audit', async (req, res) => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      error: 'DEEPSEEK_API_KEY is not configured on the server.',
    });
    return;
  }

  const metrics = req.body as AuditMetrics;
  const prompt = `You are an operations analyst for AgriTrans, a Rwandan agricultural logistics platform.
Write a concise system audit (3-5 short paragraphs) based on these live metrics:
${JSON.stringify(metrics, null, 2)}

Cover: operator verification backlog, open consignment leads, commission rate impact, transaction settlement pipeline, and active dispatch health.
Be specific with numbers from the data. Professional tone. No markdown headings.`;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content:
              'You produce brief operational audit summaries for logistics control towers.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 800,
        temperature: 0.4,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message =
        (data as { error?: { message?: string } })?.error?.message ??
        'DeepSeek API request failed';
      res.status(502).json({ error: message });
      return;
    }

    const summary =
      (data as { choices?: { message?: { content?: string } }[] })?.choices?.[0]
        ?.message?.content?.trim() ?? '';

    if (!summary) {
      res.status(502).json({ error: 'Empty response from DeepSeek' });
      return;
    }

    res.json({ summary });
  } catch {
    res.status(502).json({ error: 'Failed to reach DeepSeek API' });
  }
});

const distPath = path.join(__dirname, '..', 'dist');
if (existsSync(distPath)) {
  const indexPath = path.join(distPath, 'index.html');
  const indexTemplate = readFileSync(indexPath, 'utf-8');
  const runtimeConfigScript = buildRuntimeConfigScript();

  app.use(express.static(distPath, { index: false }));
  app.get('*', (_req, res) => {
    const html = indexTemplate.includes('</head>')
      ? indexTemplate.replace('</head>', `${runtimeConfigScript}</head>`)
      : `${runtimeConfigScript}${indexTemplate}`;
    res.type('html').send(html);
  });
}

app.listen(PORT, () => {
  console.log(`Mavuno API server listening on http://localhost:${PORT}`);
});
