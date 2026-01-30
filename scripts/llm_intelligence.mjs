#!/usr/bin/env node
/**
 * LLM Intelligence Gathering Script
 * Uses Manus built-in LLM (Gemini 2.5 Flash) to search for Caribbean business signals
 * Returns JSON array of signals
 */

import { invokeLLM } from '../server/_core/llm.ts';

const prompt = `Search for recent Caribbean business and trade signals from the past 24 hours.
Focus on:
- Export/import news (coffee, agriculture, manufacturing)
- Regional trade agreements
- Investment announcements
- Infrastructure projects
- Technology/digital economy developments
- Brain gain/diaspora return initiatives

For each signal found, provide:
1. Signal ID (format: SIG-XXX where XXX is 3 random digits)
2. Date (YYYY-MM-DD, use today's date: ${new Date().toISOString().split('T')[0]})
3. Description (1-2 sentences)
4. Category (Trade/Investment/Technology/Policy/Infrastructure)
5. Trade Relevance Score (0.0-1.0, where 1.0 is highest relevance to Caribbean trade)

Return ONLY a JSON object with a "signals" array field.
Example: {"signals": [{"signal_id": "SIG-123", "date": "2026-01-30", "description": "...", "category": "Trade", "score": 0.92}]}`;

async function main() {
  try {
    const result = await invokeLLM({
      messages: [
        { role: 'system', content: 'You are a Caribbean trade intelligence analyst. Return only valid JSON with a signals array.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });
    
    const content = result.choices[0].message.content;
    console.log(content);
  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
}

main();
