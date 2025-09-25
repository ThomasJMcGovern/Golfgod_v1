# Tournament Results API Reference

The Tournament Results API manages tournament data, including individual player results, leaderboards, and historical tournament information.

## API Functions

### `importResultsJSON`

Imports tournament results for a single player from JSON format.

```typescript
// convex/tournamentResults.ts
export const importResultsJSON = mutation({
  args: {
    playerName: v.string(),
    years: v.array(
      v.object({
        year: v.number(),
        tournaments: v.array(
          v.object({
            date: v.string(),
            tournament: v.string(),
            position: v.string(),
            score: v.string(),
            overall: v.string(),
            earnings: v.number(),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Imports tournament results
  },
});
```

**Parameters:**
- `playerName`: Name of the player (must match existing player)
- `years`: Array of year objects containing tournament data

**Input Format:**
```json
{
  "playerName": "Scottie Scheffler",
  "years": [
    {
      "year": 2024,
      "tournaments": [
        {
          "date": "Apr 11 - 14",
          "tournament": "Masters Tournament",
          "position": "1",
          "score": "-11",
          "overall": "277",
          "earnings": 3600000
        }
      ]
    }
  ]
}
```

**Returns:**
```typescript
{
  imported: number,        // Number of results imported
  errors: string[],       // Array of error messages
  playerName: string,     // Player name processed
}
```

### `importBatchResultsJSON`

Imports tournament results for multiple players in batch.

```typescript
export const importBatchResultsJSON = mutation({
  args: {
    players: v.array(
      v.object({
        playerName: v.string(),
        years: v.array(/* ... same structure as above ... */)
      })
    ),
  },
  handler: async (ctx, args) => {
    // Batch import results
  },
});
```

**Parameters:**
- `players`: Array of player objects with tournament data

**Returns:**
```typescript
{
  totalImported: number,      // Total results imported
  playersProcessed: number,   // Players successfully processed
  errors: string[],          // Error messages
}
```

### `getPlayerTournamentResults`

Retrieves all tournament results for a specific player.

```typescript
export const getPlayerTournamentResults = query({
  args: {
    playerId: v.id("players"),
    year: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Returns player's tournament history
  },
});
```

**Parameters:**
- `playerId`: Unique player ID
- `year` (optional): Filter by specific year

**Returns:**
```typescript
Array<{
  _id: Id<"tournamentResults">,
  playerId: Id<"players">,
  playerName: string,
  year: number,
  date: string,
  tournament: string,
  position: string,
  score: string,
  overall: string,
  earnings: number,
}>
```

### `getTournamentResults`

Retrieves leaderboard for a specific tournament.

```typescript
export const getTournamentResults = query({
  args: {
    tournament: v.string(),
    year: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Returns tournament leaderboard
  },
});
```

**Parameters:**
- `tournament`: Tournament name
- `year` (optional): Filter by year

**Returns:**
```typescript
Array<{
  _id: Id<"tournamentResults">,
  playerName: string,
  position: string,
  score: string,
  overall: string,
  earnings: number,
}>
```

Results are sorted by position (1, 2, T3, etc., then MC, WD, DQ).

### `getAllTournaments`

Retrieves list of all unique tournaments in the database.

```typescript
export const getAllTournaments = query({
  handler: async (ctx) => {
    // Returns array of tournament names
  },
});
```

**Returns:**
```typescript
string[] // Sorted array of tournament names
```

### `checkResultsStatus`

Provides statistics about imported tournament results.

```typescript
export const checkResultsStatus = query({
  handler: async (ctx) => {
    // Returns import statistics
  },
});
```

**Returns:**
```typescript
{
  totalResults: number,           // Total tournament results
  uniquePlayers: number,          // Number of players with results
  playerCounts: Array<[string, number]>,  // Top 10 players by result count
  yearCounts: Array<[number, number]>,    // Results by year
  sampleScottie: Array<{          // Sample Scottie Scheffler results
    year: number,
    tournament: string,
    position: string,
    earnings: number,
  }>,
}
```

### `clearAllResults`

Removes all tournament results from the database (Admin only).

```typescript
export const clearAllResults = mutation({
  handler: async (ctx) => {
    // Clears all tournament results
  },
});
```

**Returns:**
```typescript
{
  deleted: number,  // Number of records deleted
}
```

**Authentication Required:** Yes (Admin only)

### `importTournamentResults` (Legacy)

Legacy CSV import function for tournament results.

```typescript
export const importTournamentResults = mutation({
  args: {
    results: v.array(
      v.object({
        name: v.string(),
        year: v.number(),
        date: v.string(),
        tournament: v.string(),
        position: v.string(),
        score: v.string(),
        overall: v.string(),
        earnings: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Legacy import function
  },
});
```

## Usage Examples

### Display Player Results

```tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function PlayerResults({ playerId }) {
  const results = useQuery(api.tournamentResults.getPlayerTournamentResults, {
    playerId,
    year: 2024
  });

  if (!results) return <div>Loading...</div>;

  // Calculate statistics
  const totalEarnings = results.reduce((sum, r) => sum + r.earnings, 0);
  const wins = results.filter(r => r.position === "1").length;
  const top10s = results.filter(r => {
    const pos = parseInt(r.position.replace("T", ""));
    return !isNaN(pos) && pos <= 10;
  }).length;

  return (
    <div>
      <h2>2024 Tournament Results</h2>
      <div>
        <p>Events: {results.length}</p>
        <p>Wins: {wins}</p>
        <p>Top 10s: {top10s}</p>
        <p>Earnings: ${totalEarnings.toLocaleString()}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Tournament</th>
            <th>Position</th>
            <th>Score</th>
            <th>Earnings</th>
          </tr>
        </thead>
        <tbody>
          {results.map(result => (
            <tr key={result._id}>
              <td>{result.date}</td>
              <td>{result.tournament}</td>
              <td>{result.position}</td>
              <td>{result.score}</td>
              <td>${result.earnings.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Tournament Leaderboard

```tsx
function TournamentLeaderboard({ tournamentName, year }) {
  const results = useQuery(api.tournamentResults.getTournamentResults, {
    tournament: tournamentName,
    year
  });

  const getPositionColor = (position) => {
    if (position === "1") return "gold";
    if (position.startsWith("T") && parseInt(position.substring(1)) <= 10) {
      return "green";
    }
    if (position === "MC" || position === "Missed Cut") return "gray";
    return "black";
  };

  return (
    <div>
      <h2>{tournamentName} - {year}</h2>
      <table>
        <thead>
          <tr>
            <th>Position</th>
            <th>Player</th>
            <th>Score</th>
            <th>Total</th>
            <th>Earnings</th>
          </tr>
        </thead>
        <tbody>
          {results?.map(result => (
            <tr key={result._id}>
              <td style={{ color: getPositionColor(result.position) }}>
                {result.position}
              </td>
              <td>{result.playerName}</td>
              <td>{result.score}</td>
              <td>{result.overall}</td>
              <td>${result.earnings.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Import Results

```tsx
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function ImportResults() {
  const importResults = useMutation(api.tournamentResults.importResultsJSON);
  const [jsonData, setJsonData] = useState("");

  const handleImport = async () => {
    try {
      const data = JSON.parse(jsonData);
      const result = await importResults(data);
      console.log(`Imported ${result.imported} results`);
      if (result.errors.length > 0) {
        console.error("Errors:", result.errors);
      }
    } catch (error) {
      console.error("Import failed:", error);
    }
  };

  return (
    <div>
      <textarea
        value={jsonData}
        onChange={(e) => setJsonData(e.target.value)}
        placeholder="Paste JSON data here..."
      />
      <button onClick={handleImport}>Import Results</button>
    </div>
  );
}
```

## Position Values

The API handles various position formats:

- **Numeric**: `"1"`, `"2"`, `"3"` (finishing position)
- **Tied**: `"T1"`, `"T10"` (tied positions)
- **Missed Cut**: `"MC"` or `"Missed Cut"`
- **Withdrew**: `"WD"` (withdrew from tournament)
- **Disqualified**: `"DQ"` (disqualified)

## Data Import Guidelines

### JSON Format Requirements

1. Player names must exactly match existing players in the database
2. Years should be valid integers (e.g., 2024)
3. Dates should be in format "Mon DD - DD" (e.g., "Jul 18 - 21")
4. Scores relative to par (e.g., "-10", "+2", "E")
5. Overall scores as total strokes (e.g., "270")
6. Earnings in USD as numbers (no formatting)

### Batch Import Best Practices

- Process in batches of 5-10 players to avoid timeouts
- Validate player names before import
- Handle errors gracefully
- Monitor import progress
- Keep logs of import operations

## Error Handling

Common errors and their solutions:

- **Player not found**: Ensure player exists in database first
- **Invalid JSON format**: Validate JSON structure matches schema
- **Timeout errors**: Reduce batch size
- **Duplicate entries**: System prevents duplicate tournament results

## Performance Tips

- Index queries by player, tournament, and year
- Use pagination for large result sets
- Cache tournament lists on client
- Batch imports for large datasets
- Consider date range filtering for historical data