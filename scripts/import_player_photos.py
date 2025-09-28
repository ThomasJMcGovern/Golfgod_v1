#!/usr/bin/env python3
"""
Import player photos from CSV into Convex database
"""

import os
import sys
import csv
import time
from pathlib import Path
from typing import List, Dict, Any
from convex import ConvexClient
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent.parent / '.env.local'
load_dotenv(env_path)

# Configuration
CSV_FILE_PATH = "/Users/tjmcgovern/golfdata/player_photos_all_200.csv"
BATCH_SIZE = 25  # Process 25 players at a time to avoid timeouts
CONVEX_URL = os.getenv('NEXT_PUBLIC_CONVEX_URL')

if not CONVEX_URL:
    print("Error: NEXT_PUBLIC_CONVEX_URL not found in .env.local")
    sys.exit(1)

# Initialize Convex client
client = ConvexClient(CONVEX_URL)


def read_csv_data() -> List[Dict[str, Any]]:
    """Read player photo data from CSV file"""
    players = []

    try:
        with open(CSV_FILE_PATH, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                # Only include players where photo exists
                if row.get('photo_exists', '').lower() == 'true':
                    players.append({
                        'playerName': row['player_name'].strip(),
                        'espnId': row['player_id'].strip(),
                        'photoUrl': row['photo_url'].strip(),
                        'worldRank': int(row['world_rank']) if row['world_rank'].isdigit() else 999,
                    })
    except FileNotFoundError:
        print(f"Error: CSV file not found at {CSV_FILE_PATH}")
        sys.exit(1)
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        sys.exit(1)

    return players


def check_current_status():
    """Check the current status of player photos in database"""
    try:
        status = client.query("playerPhotos:getPhotoUpdateStatus")
        print("\n=== Current Database Status ===")
        print(f"Total Players: {status['totalPlayers']}")
        print(f"Players with Photos: {status['playersWithPhotos']}")
        print(f"Players with ESPN ID: {status['playersWithEspnId']}")
        print(f"Players with World Ranking: {status['playersWithWorldRanking']}")
        print(f"Missing Photos: {status['missingPhotos']}")
        print("=" * 30)
        return status
    except Exception as e:
        print(f"Could not fetch status: {e}")
        return None


def import_players_batch(players: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Import a batch of players"""
    try:
        result = client.mutation(
            "playerPhotos:updatePlayerPhotosBatch",
            {"players": players}
        )
        return result
    except Exception as e:
        print(f"Error in batch import: {e}")
        # Try individual imports as fallback
        results = {
            'processed': 0,
            'updated': 0,
            'created': 0,
            'errors': 0,
            'errorDetails': []
        }

        for player in players:
            try:
                individual_result = client.mutation(
                    "playerPhotos:updatePlayerPhoto",
                    player
                )
                results['processed'] += 1
                if individual_result['action'] == 'updated':
                    results['updated'] += 1
                else:
                    results['created'] += 1
            except Exception as individual_error:
                results['errors'] += 1
                results['errorDetails'].append({
                    'playerName': player['playerName'],
                    'error': str(individual_error)
                })

        return results


def main():
    """Main import function"""
    print("=== Player Photo Import Script ===")
    print(f"CSV File: {CSV_FILE_PATH}")
    print(f"Convex URL: {CONVEX_URL}")
    print(f"Batch Size: {BATCH_SIZE}")

    # Check current status
    print("\nChecking current database status...")
    initial_status = check_current_status()

    # Read CSV data
    print("\nReading CSV data...")
    players = read_csv_data()
    print(f"Found {len(players)} players with photos in CSV")

    if not players:
        print("No players to import")
        return

    # Import in batches
    print(f"\nStarting import in batches of {BATCH_SIZE}...")
    total_processed = 0
    total_updated = 0
    total_created = 0
    total_errors = 0
    all_errors = []

    for i in range(0, len(players), BATCH_SIZE):
        batch = players[i:i + BATCH_SIZE]
        batch_num = (i // BATCH_SIZE) + 1
        total_batches = (len(players) + BATCH_SIZE - 1) // BATCH_SIZE

        print(f"\nProcessing batch {batch_num}/{total_batches} ({len(batch)} players)...")

        # Show player names in this batch
        batch_names = [p['playerName'] for p in batch[:5]]  # Show first 5
        if len(batch) > 5:
            batch_names.append(f"... and {len(batch) - 5} more")
        print(f"  Players: {', '.join(batch_names)}")

        # Import batch
        result = import_players_batch(batch)

        # Update totals
        total_processed += result.get('processed', 0)
        total_updated += result.get('updated', 0)
        total_created += result.get('created', 0)
        total_errors += result.get('errors', 0)

        if result.get('errorDetails'):
            all_errors.extend(result['errorDetails'])

        # Show batch results
        print(f"  Processed: {result.get('processed', 0)}")
        print(f"  Updated: {result.get('updated', 0)}")
        print(f"  Created: {result.get('created', 0)}")
        if result.get('errors', 0) > 0:
            print(f"  Errors: {result.get('errors', 0)}")

        # Small delay between batches to avoid rate limiting
        if i + BATCH_SIZE < len(players):
            time.sleep(0.5)

    # Final summary
    print("\n" + "=" * 50)
    print("=== Import Complete ===")
    print(f"Total Processed: {total_processed}")
    print(f"Total Updated: {total_updated}")
    print(f"Total Created: {total_created}")
    print(f"Total Errors: {total_errors}")

    # Show errors if any
    if all_errors:
        print("\n=== Errors ===")
        for error in all_errors[:10]:  # Show first 10 errors
            print(f"  {error['playerName']}: {error['error']}")
        if len(all_errors) > 10:
            print(f"  ... and {len(all_errors) - 10} more errors")

    # Check final status
    print("\nChecking final database status...")
    final_status = check_current_status()

    if initial_status and final_status:
        print("\n=== Changes ===")
        print(f"Photos added: {final_status['playersWithPhotos'] - initial_status['playersWithPhotos']}")
        print(f"ESPN IDs added: {final_status['playersWithEspnId'] - initial_status['playersWithEspnId']}")
        print(f"Rankings added: {final_status['playersWithWorldRanking'] - initial_status['playersWithWorldRanking']}")

    print("\n✅ Import process complete!")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Import cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)