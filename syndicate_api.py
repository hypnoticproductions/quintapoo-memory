#!/usr/bin/env python3
"""
Quintapoo Syndication Engine - API-First Approach
Syndicates articles to Dev.to and Hashnode via their APIs.
For LinkedIn, Twitter, Substack, Medium: Use browser automation (separate script).
"""

import os
import requests
import json

# Article content
ARTICLE_TITLE = "Insularity as a Secret Weapon: Why the Caribbean Brain Gain is the Decade's Biggest Trade Signal"
ARTICLE_BODY = """## The Myth of the Drain

For decades, the narrative of the Caribbean has been one of depletion. We were told our best minds were our greatest export—fueling the tech engines of Silicon Valley and the financial hubs of London while our own islands remained "paradise" for everyone but those who lived there.

That narrative just hit a wall.

With the recent shifts in global immigration policy and the tightening of borders in traditional tech meccas, the "Brain Drain" has reversed. We are witnessing a **"Strategic Density"** event. The talent is coming home, and they aren't coming back to retire. They are coming back to build.

## From Insularity to Advantage

The world calls us "insular." They mean it as a limitation. At Morphic, we see it as our secret weapon.

Insularity, in a trade context, means focus. It means a high-pressure environment where every innovation must be pragmatic because resources are finite. When you combine Silicon Valley expertise with Caribbean resourcefulness, you don't just get a startup, you get a **"Morphic Fit"**.

---

*Analysis by WUKR Wire Intelligence*
"""

# API Configuration (Set these as environment variables or replace with actual keys)
DEVTO_API_KEY = os.getenv("DEVTO_API_KEY", "")
HASHNODE_API_KEY = os.getenv("HASHNODE_API_KEY", "")
HASHNODE_PUBLICATION_ID = os.getenv("HASHNODE_PUBLICATION_ID", "")

def syndicate_to_devto():
    """Syndicate article to Dev.to"""
    if not DEVTO_API_KEY:
        print("[Dev.to] ❌ API key not set. Skipping.")
        return False
    
    url = "https://dev.to/api/articles"
    headers = {
        "api-key": DEVTO_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "article": {
            "title": ARTICLE_TITLE,
            "body_markdown": ARTICLE_BODY,
            "published": True,
            "tags": ["caribbean", "tech", "business", "globalization"]
        }
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code == 201:
            data = response.json()
            print(f"[Dev.to] ✅ Published: {data.get('url', 'N/A')}")
            return True
        else:
            print(f"[Dev.to] ❌ Error {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"[Dev.to] ❌ Exception: {e}")
        return False

def syndicate_to_hashnode():
    """Syndicate article to Hashnode"""
    if not HASHNODE_API_KEY or not HASHNODE_PUBLICATION_ID:
        print("[Hashnode] ❌ API key or Publication ID not set. Skipping.")
        return False
    
    url = "https://gql.hashnode.com/"
    headers = {
        "Authorization": HASHNODE_API_KEY,
        "Content-Type": "application/json"
    }
    
    mutation = """
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        post {
          id
          slug
          url
        }
      }
    }
    """
    
    variables = {
        "input": {
            "title": ARTICLE_TITLE,
            "contentMarkdown": ARTICLE_BODY,
            "publicationId": HASHNODE_PUBLICATION_ID,
            "tags": [{"slug": "caribbean"}, {"slug": "tech"}, {"slug": "business"}]
        }
    }
    
    payload = {
        "query": mutation,
        "variables": variables
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code == 200:
            data = response.json()
            if "errors" in data:
                print(f"[Hashnode] ❌ GraphQL Error: {data['errors']}")
                return False
            post_url = data.get("data", {}).get("createPost", {}).get("post", {}).get("url", "N/A")
            print(f"[Hashnode] ✅ Published: {post_url}")
            return True
        else:
            print(f"[Hashnode] ❌ Error {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"[Hashnode] ❌ Exception: {e}")
        return False

def main():
    print("=" * 60)
    print("QUINTAPOO SYNDICATION ENGINE - API MODE")
    print("=" * 60)
    print(f"Article: {ARTICLE_TITLE[:50]}...")
    print("-" * 60)
    
    results = {
        "Dev.to": syndicate_to_devto(),
        "Hashnode": syndicate_to_hashnode()
    }
    
    print("-" * 60)
    print("SYNDICATION SUMMARY:")
    for platform, success in results.items():
        status = "✅ SUCCESS" if success else "❌ FAILED"
        print(f"  {platform}: {status}")
    
    print("=" * 60)
    print("\nFor LinkedIn, Twitter, Substack, Medium:")
    print("  → Use browser automation (requires login)")
    print("  → Navigate to each platform and post manually")
    print("  → Or configure browser automation script")
    print("=" * 60)

if __name__ == "__main__":
    main()
