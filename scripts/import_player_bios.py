#!/usr/bin/env python3

import csv
import json
import os
import sys
import re
from typing import Dict, List, Any, Optional
from convex import ConvexClient

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Check for Convex URL
CONVEX_URL = os.getenv("NEXT_PUBLIC_CONVEX_URL")
if not CONVEX_URL:
    # Try alternative env var names
    CONVEX_URL = os.getenv("CONVEX_URL")

if not CONVEX_URL:
    # Fallback to hardcoded URL if env vars not found
    CONVEX_URL = "https://brainy-tiger-452.convex.cloud"
    print(f"Using hardcoded Convex URL: {CONVEX_URL}")

# Initialize Convex client
client = ConvexClient(CONVEX_URL)

def parse_birthdate(birthdate_str: str) -> Optional[str]:
    """Extract birthdate from format like '6/21/1996 (29)'"""
    if not birthdate_str:
        return None

    # Remove age in parentheses
    match = re.match(r'^([^(]+)', birthdate_str)
    if match:
        return match.group(1).strip()
    return birthdate_str.strip()

def parse_turned_pro(turned_pro_str: str) -> Optional[int]:
    """Parse turned pro year as integer"""
    if not turned_pro_str:
        return None
    try:
        year = int(turned_pro_str)
        # Validate reasonable year range
        if 1950 <= year <= 2025:
            return year
    except ValueError:
        pass
    return None

def process_player_bio(row: Dict[str, str]) -> Dict[str, Any]:
    """Process a single player row from CSV"""
    # Parse birthdate (remove age in parentheses)
    birthdate = parse_birthdate(row.get('birthdate', ''))

    # Parse turned pro as integer
    turned_pro = parse_turned_pro(row.get('turned_pro', ''))

    # Parse swing (ensure it's Right or Left)
    swing = row.get('swing', '').strip()
    if swing not in ['Right', 'Left']:
        swing = None

    # Build player bio object
    player_bio = {
        'espnId': row.get('player_id', '').strip(),
        'playerName': row.get('player_name', '').strip(),
        'country': row.get('country', '').strip() if row.get('country') else None,
        'birthDate': birthdate,
        'birthPlace': row.get('birthplace', '').strip() if row.get('birthplace') else None,
        'college': row.get('college', '').strip() if row.get('college') else None,
        'height': row.get('height', '').strip() if row.get('height') else None,
        'weight': row.get('weight', '').strip() if row.get('weight') else None,
        'turnedPro': turned_pro,
        'swing': swing
    }

    # Remove None values to avoid sending empty data
    player_bio = {k: v for k, v in player_bio.items() if v is not None}

    return player_bio

def import_bios_batch(players: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Import a batch of player bios to Convex"""
    try:
        result = client.mutation(
            "playerBios:updatePlayerBiosBatch",
            {"players": players}
        )
        return result
    except Exception as e:
        print(f"Error calling Convex mutation: {e}")
        return {"updated": 0, "skipped": len(players), "errors": [str(e)]}

def main():
    """Main import function"""
    csv_file = "/Users/tjmcgovern/golfdata/player_bios_all_200.csv"

    if not os.path.exists(csv_file):
        print(f"Error: CSV file not found at {csv_file}")
        sys.exit(1)

    print(f"Reading CSV file: {csv_file}")

    total_stats = {
        'total_processed': 0,
        'total_updated': 0,
        'total_skipped': 0,
        'total_errors': []
    }

    try:
        with open(csv_file, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            batch = []
            batch_size = 20  # Process in batches of 20

            for row_num, row in enumerate(reader, start=1):
                # Process the row
                player_bio = process_player_bio(row)

                # Skip if no ESPN ID or player name
                if not player_bio.get('espnId') or not player_bio.get('playerName'):
                    print(f"  Skipping row {row_num}: Missing ESPN ID or player name")
                    total_stats['total_skipped'] += 1
                    continue

                batch.append(player_bio)

                # Process batch when it reaches the size limit
                if len(batch) >= batch_size:
                    print(f"\nProcessing batch of {len(batch)} players...")
                    result = import_bios_batch(batch)

                    # Update statistics
                    total_stats['total_processed'] += len(batch)
                    total_stats['total_updated'] += result.get('updated', 0)
                    total_stats['total_skipped'] += result.get('skipped', 0)
                    if result.get('errors'):
                        total_stats['total_errors'].extend(result['errors'])

                    print(f"  Updated: {result.get('updated', 0)}")
                    print(f"  Skipped: {result.get('skipped', 0)}")

                    if result.get('errors'):
                        for error in result['errors'][:5]:  # Show first 5 errors
                            print(f"  Error: {error}")

                    batch = []

            # Process remaining batch
            if batch:
                print(f"\nProcessing final batch of {len(batch)} players...")
                result = import_bios_batch(batch)

                total_stats['total_processed'] += len(batch)
                total_stats['total_updated'] += result.get('updated', 0)
                total_stats['total_skipped'] += result.get('skipped', 0)
                if result.get('errors'):
                    total_stats['total_errors'].extend(result['errors'])

                print(f"  Updated: {result.get('updated', 0)}")
                print(f"  Skipped: {result.get('skipped', 0)}")

                if result.get('errors'):
                    for error in result['errors'][:5]:
                        print(f"  Error: {error}")

    except Exception as e:
        print(f"Error reading CSV file: {e}")
        sys.exit(1)

    # Print final summary
    print("\n" + "="*50)
    print("IMPORT SUMMARY")
    print("="*50)
    print(f"Total rows processed: {total_stats['total_processed']}")
    print(f"Successfully updated: {total_stats['total_updated']}")
    print(f"Skipped: {total_stats['total_skipped']}")
    print(f"Errors encountered: {len(total_stats['total_errors'])}")

    if total_stats['total_errors']:
        print("\nFirst 10 errors:")
        for error in total_stats['total_errors'][:10]:
            print(f"  - {error}")

    print("\n✅ Biography import completed!")

    # Check bio completeness
    print("\nChecking bio completeness...")
    try:
        completeness = client.mutation("playerBios:checkBioCompleteness", {})
        print(f"\nBio Completeness Report:")
        print(f"  Total players: {completeness.get('total', 0)}")
        print(f"  With birth date: {completeness.get('withBirthDate', 0)}")
        print(f"  With birth place: {completeness.get('withBirthPlace', 0)}")
        print(f"  With college: {completeness.get('withCollege', 0)}")
        print(f"  With height: {completeness.get('withHeight', 0)}")
        print(f"  With weight: {completeness.get('withWeight', 0)}")
        print(f"  With turned pro: {completeness.get('withTurnedPro', 0)}")
        print(f"  With swing: {completeness.get('withSwing', 0)}")
        print(f"  Complete profiles: {completeness.get('complete', 0)}")

        if completeness.get('incomplete') and len(completeness['incomplete']) > 0:
            print(f"\nPlayers with incomplete bios (first 10):")
            for name in completeness['incomplete'][:10]:
                print(f"    - {name}")
    except Exception as e:
        print(f"Could not check bio completeness: {e}")

if __name__ == "__main__":
    main()