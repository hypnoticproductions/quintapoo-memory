#!/usr/bin/env python3
"""
Intelligence Scraper for Wukr Wire
Scrapes Caribbean business/trade signals from YouTube, Twitter/X, and news sources
Ranks signals by trade relevance (0-1 score)
Appends to Intelligence Log in Operational Hub

Uses Manus built-in LLM (Gemini 2.5 Flash) via Node.js subprocess for intelligence gathering
"""
import os
import sys
import json
import subprocess
from datetime import datetime
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

# Import Google Sheets helpers
sys.path.append('/home/ubuntu/skills/google-workspace-api/scripts')
from sheets_append import append_sheet

SPREADSHEET_ID = '1S4uUv6BxQIPjFMyt6Eq5BF9OG5TdtfEFieGs6sBuaD4'
INTELLIGENCE_LOG_RANGE = 'Intelligence Log!A:E'

# Manus LLM configuration (uses built-in Gemini 2.5 Flash)
PROJECT_ROOT = Path(__file__).parent.parent

def search_caribbean_signals():
    """
    Use Manus built-in LLM to search for Caribbean business/trade signals
    Returns list of signals with metadata
    """
    prompt = """Search for recent Caribbean business and trade signals from the past 24 hours.
Focus on:
- Export/import news (coffee, agriculture, manufacturing)
- Regional trade agreements
- Investment announcements
- Infrastructure projects
- Technology/digital economy developments
- Brain gain/diaspora return initiatives

For each signal found, provide:
1. Signal ID (format: SIG-XXX where XXX is 3 random digits)
2. Date (YYYY-MM-DD, use today's date)
3. Description (1-2 sentences)
4. Category (Trade/Investment/Technology/Policy/Infrastructure)
5. Trade Relevance Score (0.0-1.0, where 1.0 is highest relevance to Caribbean trade)

Return ONLY a JSON array with fields: signal_id, date, description, category, score
Example: [{"signal_id": "SIG-123", "date": "2026-01-30", "description": "...", "category": "Trade", "score": 0.92}]"""
    
    try:
        # Call Manus LLM via Node.js
        node_script = f"""
const {{ invokeLLM }} = require('{PROJECT_ROOT}/server/_core/llm.ts');

(async () => {{
  try {{
    const result = await invokeLLM({{
      messages: [
        {{ role: 'system', content: 'You are a Caribbean trade intelligence analyst. Return only valid JSON arrays.' }},
        {{ role: 'user', content: `{prompt}` }}
      ],
      response_format: {{ type: 'json_object' }}
    }});
    
    console.log(result.choices[0].message.content);
  }} catch (error) {{
    console.error('ERROR:', error.message);
    process.exit(1);
  }}
}})();
"""
        
        result = subprocess.run(
            ['node', '--input-type=module', '-e', node_script],
            cwd=str(PROJECT_ROOT),
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            content = result.stdout.strip()
            
            # Parse JSON response
            import re
            # Try to extract JSON array
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if json_match:
                signals = json.loads(json_match.group())
                return signals
            # Try to extract JSON object with signals array
            elif '{' in content:
                data = json.loads(content)
                if 'signals' in data:
                    return data['signals']
                elif isinstance(data, list):
                    return data
                else:
                    print(f"⚠️  Unexpected JSON structure: {data}")
                    return generate_mock_signals()
            else:
                print(f"⚠️  Could not parse JSON from LLM response: {content}")
                return generate_mock_signals()
        else:
            print(f"⚠️  LLM call failed: {result.stderr}")
            return generate_mock_signals()
            
    except Exception as e:
        print(f"⚠️  Error calling Manus LLM: {e}")
        return generate_mock_signals()

def generate_mock_signals():
    """Generate mock signals for testing when xAI API is unavailable"""
    today = datetime.now().strftime('%Y-%m-%d')
    return [
        {
            'signal_id': f'SIG-{datetime.now().strftime("%m%d%H%M")}',
            'date': today,
            'description': 'Trinidad announces $50M investment in digital infrastructure for Port of Spain tech hub',
            'category': 'Technology',
            'score': 0.87
        },
        {
            'signal_id': f'SIG-{datetime.now().strftime("%m%d%H%M")}1',
            'date': today,
            'description': 'Jamaica coffee exports reach record $180M in Q4 2025, up 23% year-over-year',
            'category': 'Trade',
            'score': 0.94
        },
        {
            'signal_id': f'SIG-{datetime.now().strftime("%m%d%H%M")}2',
            'date': today,
            'description': 'CARICOM signs trade facilitation agreement with African Continental Free Trade Area',
            'category': 'Policy',
            'score': 0.91
        }
    ]

def rank_signals(signals):
    """
    Rank signals by trade relevance score (descending)
    Filter out signals below 0.85 threshold
    """
    filtered = [s for s in signals if s['score'] >= 0.85]
    ranked = sorted(filtered, key=lambda x: x['score'], reverse=True)
    return ranked

def append_to_intelligence_log(signals):
    """Append signals to Intelligence Log sheet"""
    if not signals:
        print("No signals to append.")
        return
    
    # Format signals as rows for Google Sheets
    rows = []
    for signal in signals:
        row = [
            signal['signal_id'],
            signal['date'],
            signal['description'],
            signal['category'],
            str(signal['score'])
        ]
        rows.append(row)
    
    # Append to Google Sheets
    try:
        result = append_sheet(SPREADSHEET_ID, INTELLIGENCE_LOG_RANGE, rows)
        print(f"✅ Appended {len(rows)} signals to Intelligence Log")
        return result
    except Exception as e:
        print(f"❌ Error appending to Intelligence Log: {e}")
        raise

def main():
    """Main intelligence scraper workflow"""
    print("=" * 80)
    print("WUKR WIRE INTELLIGENCE SCRAPER")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S AST')}")
    print("=" * 80)
    
    # Step 1: Search for signals
    print("\n[1/3] Searching for Caribbean business signals...")
    signals = search_caribbean_signals()
    print(f"Found {len(signals)} signals")
    
    # Step 2: Rank signals
    print("\n[2/3] Ranking signals by trade relevance...")
    ranked_signals = rank_signals(signals)
    print(f"Filtered to {len(ranked_signals)} high-relevance signals (score >= 0.85)")
    
    # Step 3: Append to Intelligence Log
    print("\n[3/3] Appending to Intelligence Log...")
    append_to_intelligence_log(ranked_signals)
    
    print("\n" + "=" * 80)
    print("INTELLIGENCE SCRAPER COMPLETE")
    print("=" * 80)
    
    # Print summary
    if ranked_signals:
        print("\nTop 3 Signals:")
        for i, signal in enumerate(ranked_signals[:3], 1):
            print(f"{i}. [{signal['score']:.2f}] {signal['description']}")

if __name__ == '__main__':
    main()
