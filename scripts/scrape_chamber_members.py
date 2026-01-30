#!/usr/bin/env python3
"""
Scrape Saint Lucia Chamber of Commerce member directory
Target: https://www.stluciachamber.org/members/members-list
"""

import requests
from bs4 import BeautifulSoup
import csv
import time
import re

def scrape_chamber_page(page_num=1):
    """Scrape single page of Chamber member directory"""
    if page_num == 1:
        url = "https://www.stluciachamber.org/members/members-list"
    else:
        url = f"https://www.stluciachamber.org/members/members-list?30ffab73_page={page_num}"
    
    print(f"Scraping page {page_num}: {url}")
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        members = []
        
        # Find all member cards/listings
        # Pattern 1: Look for member name links
        member_links = soup.find_all('a', href=re.compile(r'/members/'))
        
        for link in member_links:
            member_name = link.get_text(strip=True)
            if member_name and len(member_name) > 3:  # Filter out short/empty names
                member_url = link.get('href')
                if member_url and not member_url.startswith('http'):
                    member_url = f"https://www.stluciachamber.org{member_url}"
                
                members.append({
                    'name': member_name,
                    'profile_url': member_url,
                    'email': 'Not found',
                    'phone': 'Not found',
                    'website': 'Not found'
                })
        
        # Pattern 2: Look for direct text listings
        if not members:
            # Try finding member names in list items or divs
            potential_members = soup.find_all(['li', 'div'], class_=re.compile(r'member|company|business', re.I))
            for item in potential_members:
                text = item.get_text(strip=True)
                if text and 10 < len(text) < 100:  # Reasonable company name length
                    members.append({
                        'name': text,
                        'profile_url': 'Not found',
                        'email': 'Not found',
                        'phone': 'Not found',
                        'website': 'Not found'
                    })
        
        print(f"Found {len(members)} members on page {page_num}")
        return members
        
    except Exception as e:
        print(f"Error scraping page {page_num}: {e}")
        return []

def scrape_all_pages():
    """Scrape all pages of Chamber directory"""
    all_members = []
    page = 1
    max_pages = 20  # Safety limit
    
    while page <= max_pages:
        members = scrape_chamber_page(page)
        
        if not members:
            print(f"No members found on page {page}, stopping")
            break
        
        all_members.extend(members)
        page += 1
        time.sleep(2)  # Be polite
    
    return all_members

def save_to_csv(members, filename):
    """Save members to CSV"""
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['name', 'profile_url', 'email', 'phone', 'website'])
        writer.writeheader()
        writer.writerows(members)
    
    print(f"Saved {len(members)} members to {filename}")

if __name__ == "__main__":
    print("Scraping Saint Lucia Chamber of Commerce member directory...")
    members = scrape_all_pages()
    
    # Remove duplicates
    unique_members = []
    seen_names = set()
    for member in members:
        if member['name'] not in seen_names:
            unique_members.append(member)
            seen_names.add(member['name'])
    
    print(f"Total unique members: {len(unique_members)}")
    
    save_to_csv(unique_members, '/home/ubuntu/quintapoo-memory/SAINT_LUCIA_CHAMBER_MEMBERS.csv')
    print("Done!")
