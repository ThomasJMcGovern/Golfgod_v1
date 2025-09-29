#!/usr/bin/env python3
"""
Import 2026 tournament data to Convex database
This script reads the corrected JSON file and updates the database
"""

import json
import subprocess
import sys
from pathlib import Path

def main():
    # Read the corrected JSON file
    json_file = Path("pga_tour_schedules_playwright_2015_2026.json")

    if not json_file.exists():
        print(f"Error: {json_file} not found!")
        sys.exit(1)

    with open(json_file, "r") as f:
        data = json.load(f)

    # Filter for 2026 tournaments only
    tournaments_2026 = [t for t in data["tournaments"] if t["year"] == 2026]

    print(f"Found {len(tournaments_2026)} tournaments for 2026")

    # Process in batches of 10
    batch_size = 10
    total_processed = 0

    for i in range(0, len(tournaments_2026), batch_size):
        batch = tournaments_2026[i:i+batch_size]

        # Prepare the batch data for Convex
        batch_data = json.dumps({"tournaments": batch})

        # Call the Convex mutation
        try:
            result = subprocess.run(
                ["npx", "convex", "run", "tournaments:importTournamentsBatch", batch_data],
                capture_output=True,
                text=True,
                check=True
            )

            # Parse result
            if result.stdout:
                response = json.loads(result.stdout)
                total_processed += len(batch)
                print(f"Batch {i//batch_size + 1}: Imported {response.get('imported', 0)}, Updated {response.get('updated', 0)}")

                if response.get('errors'):
                    print(f"  Errors: {response['errors']}")

        except subprocess.CalledProcessError as e:
            print(f"Error processing batch {i//batch_size + 1}: {e}")
            print(f"Error output: {e.stderr}")
        except json.JSONDecodeError as e:
            print(f"Could not parse Convex response: {e}")

    print(f"\nTotal tournaments processed: {total_processed}")

    # Now run the fix mutation to properly set status and move winner fields
    print("\nRunning fix2026TournamentData mutation...")
    try:
        result = subprocess.run(
            ["npx", "convex", "run", "tournaments:fix2026TournamentData"],
            capture_output=True,
            text=True,
            check=True
        )

        if result.stdout:
            response = json.loads(result.stdout)
            print(f"Fixed {response.get('updated', 0)} tournaments")
            if response.get('errors'):
                print(f"Errors: {response['errors']}")

    except subprocess.CalledProcessError as e:
        print(f"Error running fix mutation: {e}")
        print(f"Error output: {e.stderr}")
    except json.JSONDecodeError as e:
        print(f"Could not parse fix response: {e}")

    print("\n✅ Import complete!")

if __name__ == "__main__":
    main()