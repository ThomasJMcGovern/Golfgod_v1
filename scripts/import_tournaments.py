#!/usr/bin/env python3

import json
import os
import sys
from typing import Dict, List, Any
from convex import ConvexClient

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Check for Convex URL
CONVEX_URL = os.getenv("NEXT_PUBLIC_CONVEX_URL")
if not CONVEX_URL:
    CONVEX_URL = os.getenv("CONVEX_URL")

if not CONVEX_URL:
    CONVEX_URL = "https://brainy-tiger-452.convex.cloud"
    print(f"Using hardcoded Convex URL: {CONVEX_URL}")

# Initialize Convex client
client = ConvexClient(CONVEX_URL)

def import_tournaments_batch(tournaments: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Import a batch of tournaments to Convex"""
    try:
        result = client.mutation(
            "tournaments:importTournamentsBatch",
            {"tournaments": tournaments}
        )
        return result
    except Exception as e:
        print(f"Error calling Convex mutation: {e}")
        return {"imported": 0, "updated": 0, "total": len(tournaments), "errors": [str(e)]}

def main():
    """Main import function"""
    json_file = "/Users/tjmcgovern/golfgod_x_convex/pga_tour_schedules_playwright_2015_2026.json"

    if not os.path.exists(json_file):
        print(f"Error: JSON file not found at {json_file}")
        sys.exit(1)

    print(f"Reading JSON file: {json_file}")

    # Read the JSON file
    with open(json_file, 'r', encoding='utf-8') as file:
        data = json.load(file)

    tournaments = data.get('tournaments', [])
    print(f"Found {len(tournaments)} tournaments to import")

    # Ask user if they want to clear existing data
    clear_data = input("\nDo you want to clear existing tournament data first? (y/n): ").lower() == 'y'

    if clear_data:
        try:
            print("Clearing existing tournament data...")
            result = client.mutation("tournaments:clearTournaments", {})
            print(f"Deleted {result.get('deleted', 0)} existing tournaments")
        except Exception as e:
            print(f"Error clearing tournaments: {e}")

    # Import in batches to avoid timeout
    batch_size = 50
    total_stats = {
        'total_imported': 0,
        'total_updated': 0,
        'total_errors': []
    }

    for i in range(0, len(tournaments), batch_size):
        batch = tournaments[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        total_batches = (len(tournaments) + batch_size - 1) // batch_size

        print(f"\nProcessing batch {batch_num}/{total_batches} ({len(batch)} tournaments)...")

        result = import_tournaments_batch(batch)

        # Update statistics
        total_stats['total_imported'] += result.get('imported', 0)
        total_stats['total_updated'] += result.get('updated', 0)
        if result.get('errors'):
            total_stats['total_errors'].extend(result['errors'])

        print(f"  Imported: {result.get('imported', 0)}")
        print(f"  Updated: {result.get('updated', 0)}")

        if result.get('errors'):
            for error in result['errors'][:3]:  # Show first 3 errors
                print(f"  Error: {error}")

    # Print final summary
    print("\n" + "="*50)
    print("IMPORT SUMMARY")
    print("="*50)
    print(f"Total tournaments processed: {len(tournaments)}")
    print(f"New tournaments imported: {total_stats['total_imported']}")
    print(f"Existing tournaments updated: {total_stats['total_updated']}")
    print(f"Errors encountered: {len(total_stats['total_errors'])}")

    if total_stats['total_errors']:
        print("\nFirst 10 errors:")
        for error in total_stats['total_errors'][:10]:
            print(f"  - {error}")

    # Show some statistics
    print("\nAnalyzing imported data...")
    try:
        # Get year summaries
        summaries = client.query("tournaments:getYearSummaries", {})

        print("\nTournaments by Year:")
        for summary in summaries[:5]:  # Show first 5 years
            print(f"  {summary['year']}: {summary['totalTournaments']} tournaments, "
                  f"{summary['completedTournaments']} completed, "
                  f"${summary['totalPrizeMoney'] / 1000000:.1f}M prize money")

        # Get recent tournaments
        recent = client.query("tournaments:getRecentTournaments", {})
        print(f"\nMost recent completed tournaments:")
        for t in recent[:5]:
            winner_info = f"{t.get('winner_name', 'TBD')}" if t.get('winner_name') else "TBD"
            print(f"  {t['year']} {t['name']}: Winner - {winner_info}")

    except Exception as e:
        print(f"Could not fetch statistics: {e}")

    print("\n✅ Tournament import completed!")
    print("You can now view the tournaments in your web application.")

if __name__ == "__main__":
    main()