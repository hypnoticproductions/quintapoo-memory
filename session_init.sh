#!/bin/bash
# Quintapoo Session Initialization Script
# Verifies date/time and loads correct daily protocol

echo "=========================================="
echo "QUINTAPOO MEMORY REPOSITORY - SESSION INIT"
echo "=========================================="

# Get current date/time in Atlantic Time (AST = UTC-4)
export TZ="America/Puerto_Rico"  # AST timezone
CURRENT_DATE=$(date +"%Y-%m-%d")
CURRENT_TIME=$(date +"%H:%M:%S")
DAY_OF_WEEK=$(date +"%A")
HOUR=$(date +"%H")

echo "Date: $CURRENT_DATE"
echo "Time: $CURRENT_TIME AST"
echo "Day: $DAY_OF_WEEK"
echo "------------------------------------------"

# Determine daily protocol from DIAGRAM 3
case $DAY_OF_WEEK in
  "Monday")
    PROTOCOL="Intelligence + Content Production Launch"
    TASKS="- 8 AM: Wukr Wire scrape\n- 12 PM: Data logging\n- 6 PM: Weekly prep"
    ;;
  "Tuesday")
    PROTOCOL="Outreach & Engagement"
    TASKS="- 8 AM: Send 10-15 personalized outreach\n- 11 AM: Respond to inbound\n- 1 PM: Publish Axis Dispatch (7+ channels)"
    ;;
  "Wednesday")
    PROTOCOL="Video & Audio Creation"
    TASKS="- 10 AM: HeyGen video generation\n- 1 PM: Podcast prep\n- 4 PM: Analytics monitoring"
    ;;
  "Thursday")
    PROTOCOL="Partnerships & Strategic Work"
    TASKS="- 9 AM: Partner outreach\n- 2 PM: Strategic planning\n- 5 PM: Week review"
    ;;
  "Friday")
    PROTOCOL="Newsletter & Community"
    TASKS="- 10 AM: Wukr Wire newsletter draft\n- 2 PM: Community engagement\n- 4 PM: Week wrap-up"
    ;;
  "Saturday")
    PROTOCOL="Research & Planning (Optional)"
    TASKS="- Light research\n- Planning for next week"
    ;;
  "Sunday")
    PROTOCOL="REST (Non-negotiable)"
    TASKS="- No work scheduled"
    ;;
esac

echo "Daily Protocol: $PROTOCOL"
echo "------------------------------------------"
echo -e "Tasks:\n$TASKS"
echo "=========================================="

# Check for fresh content
echo ""
echo "Content Freshness Check:"
LAST_ARTICLE=$(ls -t /home/ubuntu/quintapoo-memory/article_*.md 2>/dev/null | head -1)
if [ -n "$LAST_ARTICLE" ]; then
  ARTICLE_DATE=$(stat -c %y "$LAST_ARTICLE" | cut -d' ' -f1)
  echo "Last article: $(basename $LAST_ARTICLE)"
  echo "Created: $ARTICLE_DATE"
  if [ "$ARTICLE_DATE" == "$CURRENT_DATE" ]; then
    echo "Status: FRESH (created today)"
  else
    echo "Status: STALE (created $ARTICLE_DATE)"
    echo "Action: Generate new content from Wukr Wire"
  fi
else
  echo "No articles found. Generate new content."
fi

echo "=========================================="
echo "Session initialized. Ready for command."
echo "=========================================="
