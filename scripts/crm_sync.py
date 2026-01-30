#!/usr/bin/env python3
"""
CRM Sync Automation for 12 PM Daily Task
Reads Intelligence Log signals from Google Sheets
Appends new signals to CRM sheet with timestamp tracking
"""
import os
import sys
from datetime import datetime
from pathlib import Path

# Add skills directory to path
sys.path.append('/home/ubuntu/skills/google-workspace-api/scripts')
from sheets_read import read_sheet
from sheets_append import append_sheet

SPREADSHEET_ID = '1S4uUv6BxQIPjFMyt6Eq5BF9OG5TdtfEFieGs6sBuaD4'
INTELLIGENCE_LOG_RANGE = 'Intelligence Log!A:E'
CRM_RANGE = 'CRM!A:G'

# Track last sync timestamp (in production, store in database)
SYNC_STATE_FILE = '/home/ubuntu/quintapoo-memory/.crm_sync_state'

def get_last_sync_row():
    """Get the row number of last synced signal"""
    if os.path.exists(SYNC_STATE_FILE):
        with open(SYNC_STATE_FILE, 'r') as f:
            return int(f.read().strip())
    return 1  # Start from row 2 (after header)

def save_last_sync_row(row_number):
    """Save the row number of last synced signal"""
    with open(SYNC_STATE_FILE, 'w') as f:
        f.write(str(row_number))

def main():
    """Main CRM sync workflow"""
    print("=" * 80)
    print("CRM SYNC AUTOMATION")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} AST")
    print("=" * 80)
    
    # Step 1: Read Intelligence Log
    print("\n[1/3] Reading Intelligence Log...")
    try:
        intelligence_data = read_sheet(SPREADSHEET_ID, INTELLIGENCE_LOG_RANGE)
    except Exception as e:
        print(f"❌ Error reading Intelligence Log: {e}")
        return
    
    if not intelligence_data:
        print("⚠️  Intelligence Log is empty")
        return
    
    print(f"Found {len(intelligence_data)} rows in Intelligence Log")
    
    # Step 2: Identify new signals since last sync
    print("\n[2/3] Identifying new signals...")
    last_sync_row = get_last_sync_row()
    new_signals = intelligence_data[last_sync_row:]  # Skip header and synced rows
    
    if not new_signals:
        print("✅ No new signals since last sync")
        return
    
    print(f"Found {len(new_signals)} new signals to sync")
    
    # Step 3: Append new signals to CRM sheet
    print("\n[3/3] Appending to CRM sheet...")
    
    # Add sync timestamp and source to each row
    sync_timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    crm_rows = []
    
    for signal in new_signals:
        # Intelligence Log format: [signal_id, date, description, category, score]
        # CRM format: [signal_id, date, description, category, score, synced_at, source]
        if len(signal) >= 5:
            crm_row = signal[:5] + [sync_timestamp, 'Intelligence Log']
            crm_rows.append(crm_row)
    
    if not crm_rows:
        print("⚠️  No valid signals to sync")
        return
    
    try:
        append_sheet(SPREADSHEET_ID, CRM_RANGE, crm_rows)
        print(f"✅ Appended {len(crm_rows)} signals to CRM sheet")
        
        # Update sync state
        new_last_row = last_sync_row + len(new_signals)
        save_last_sync_row(new_last_row)
        print(f"Updated sync state: last row = {new_last_row}")
        
    except Exception as e:
        print(f"❌ Error appending to CRM: {e}")
        return
    
    print("\n" + "=" * 80)
    print("CRM SYNC COMPLETE")
    print("=" * 80)
    print(f"New signals synced: {len(crm_rows)}")
    print(f"Total Intelligence Log rows: {len(intelligence_data)}")
    print(f"Last synced row: {new_last_row}")

if __name__ == '__main__':
    main()
