# Data Management Guide

This guide covers all data management operations in GolfGod, including importing, exporting, and maintaining player and tournament data.

## Overview

GolfGod provides comprehensive admin tools for managing golf data:
- CSV import for player bios and rankings
- JSON import for tournament results
- Batch processing capabilities
- Data validation and error handling
- Database cleanup utilities

## Admin Pages

### 1. Import CSV Data
**Location**: `/admin/import-csv`

Import player bios, world rankings, and tournament data from CSV files.

#### Features
- Multi-tab interface for different data types
- PapaParse CSV parsing
- Real-time import progress
- Error logging and recovery
- Batch processing (25-50 records at a time)

#### Player Bios Import
```csv
name,firstName,lastName,country,birthDate,college,swing,turnedPro
"Tiger Woods","Tiger","Woods","United States","1975-12-30","Stanford","Right",1996
```

#### World Rankings Import
```csv
rank,name,country
1,"Scottie Scheffler","UNI"
2,"Rory McIlroy","NOR"
```

### 2. Import Tournament Results
**Location**: `/admin/import-results`

Import tournament results from JSON format.

#### Single Player Format
```json
{
  "playerName": "Adam Scott",
  "years": [
    {
      "year": 2024,
      "tournaments": [
        {
          "date": "Jul 18 - 21",
          "tournament": "The Open Championship",
          "position": "T10",
          "score": "-6",
          "overall": "282",
          "earnings": 293750
        }
      ]
    }
  ]
}
```

#### Batch Import Format
```json
[
  {
    "playerName": "Scottie Scheffler",
    "years": [...]
  },
  {
    "playerName": "Rory McIlroy",
    "years": [...]
  }
]
```

### 3. Data Cleanup
**Location**: `/admin/clear-data`

Clean and maintain database integrity.

#### Available Operations
- Clear all players
- Clear tournament results
- Clear player stats
- Clear user follows
- Full database reset

### 4. Ultimate Fix
**Location**: `/admin/ultimate-fix`

Comprehensive data repair tool for fixing ranking issues.

#### Process Flow
1. Clear existing data
2. Load CSV with correct rankings
3. Import in small batches (25 players)
4. Verify Scottie Scheffler is #1
5. Check for missing top 10 players

## Import Strategies

### Batch Processing

To avoid Convex read/write limits:

```typescript
const BATCH_SIZE = 25; // Optimal batch size

for (let i = 0; i < data.length; i += BATCH_SIZE) {
  const batch = data.slice(i, i + BATCH_SIZE);
  await importBatch({
    startIndex: i,
    endIndex: Math.min(i + BATCH_SIZE, data.length),
    players: batch
  });

  // Small delay between batches
  await new Promise(resolve => setTimeout(resolve, 200));
}
```

### Error Handling

```typescript
const importWithRetry = async (data, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await importData(data);
      return result;
    } catch (error) {
      if (attempt === maxRetries) throw error;

      // Exponential backoff
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
};
```

### Data Validation

Before import, validate data structure:

```typescript
const validatePlayerData = (player) => {
  const required = ['name', 'firstName', 'lastName', 'country'];

  for (const field of required) {
    if (!player[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Validate ranking
  if (player.worldRanking && (player.worldRanking < 1 || player.worldRanking > 500)) {
    throw new Error(`Invalid world ranking: ${player.worldRanking}`);
  }

  return true;
};
```

## Country Code Mapping

Standard country code conversions:

```typescript
const countryMap = {
  "UNI": { name: "United States", code: "US" },
  "NOR": { name: "Northern Ireland", code: "GB-NIR" },
  "ENG": { name: "England", code: "GB-ENG" },
  "SCO": { name: "Scotland", code: "GB-SCT" },
  "WAL": { name: "Wales", code: "GB-WLS" },
  "AUS": { name: "Australia", code: "AU" },
  "CAN": { name: "Canada", code: "CA" },
  "SOU": { name: "South Africa", code: "ZA" },
  "SWE": { name: "Sweden", code: "SE" },
  "JAP": { name: "Japan", code: "JP" },
  "IRE": { name: "Ireland", code: "IE" },
  "NEW": { name: "New Zealand", code: "NZ" },
  // ... more mappings
};
```

## Database Maintenance

### Regular Maintenance Tasks

#### 1. Verify Data Integrity
```typescript
// Check for duplicate players
const checkDuplicates = async () => {
  const players = await ctx.db.query("players").collect();
  const names = players.map(p => p.name);
  const duplicates = names.filter((name, index) =>
    names.indexOf(name) !== index
  );
  return duplicates;
};
```

#### 2. Update Rankings
```typescript
// Sync world rankings from CSV
const updateRankings = async (rankingsCSV) => {
  const rankings = parseCSV(rankingsCSV);

  for (const ranking of rankings) {
    const player = await findPlayerByName(ranking.name);
    if (player) {
      await ctx.db.patch(player._id, {
        worldRanking: ranking.rank
      });
    }
  }
};
```

#### 3. Clean Orphaned Records
```typescript
// Remove tournament results for deleted players
const cleanOrphanedResults = async () => {
  const results = await ctx.db.query("tournamentResults").collect();

  for (const result of results) {
    const player = await ctx.db.get(result.playerId);
    if (!player) {
      await ctx.db.delete(result._id);
    }
  }
};
```

### Performance Optimization

#### Index Management
Ensure proper indexes for common queries:
- `by_name` - Player name searches
- `by_world_ranking` - Ranking sorts
- `search_name` - Full-text search
- `by_player` - Player-specific queries
- `by_tournament` - Tournament leaderboards

#### Query Optimization
```typescript
// Efficient player search
const searchPlayers = async (searchTerm) => {
  return await ctx.db
    .query("players")
    .withSearchIndex("search_name", q => q.search("name", searchTerm))
    .take(10); // Limit results
};

// Batch fetch with pagination
const getPlayersPaginated = async (page = 0, limit = 50) => {
  const offset = page * limit;
  return await ctx.db
    .query("players")
    .withIndex("by_world_ranking")
    .take(limit);
};
```

## Backup and Recovery

### Export Data
```typescript
// Export all players to JSON
const exportPlayers = async () => {
  const players = await ctx.db.query("players").collect();
  return JSON.stringify(players, null, 2);
};

// Export tournament results
const exportResults = async () => {
  const results = await ctx.db.query("tournamentResults").collect();
  return JSON.stringify(results, null, 2);
};
```

### Import Backup
```typescript
// Restore from backup
const restoreFromBackup = async (backupData) => {
  const data = JSON.parse(backupData);

  // Clear existing data
  await clearAllData();

  // Import in batches
  for (const record of data) {
    await ctx.db.insert("players", record);
  }
};
```

## Monitoring and Logging

### Import Logs
Track all import operations:

```typescript
const logImport = async (operation, details) => {
  const log = {
    timestamp: Date.now(),
    operation,
    user: ctx.auth.getUserId(),
    success: details.success,
    recordsProcessed: details.count,
    errors: details.errors,
  };

  await ctx.db.insert("importLogs", log);
};
```

### Status Dashboard
Monitor database health:

```typescript
const getDatabaseStatus = async () => {
  return {
    totalPlayers: await ctx.db.query("players").count(),
    totalResults: await ctx.db.query("tournamentResults").count(),
    playersWithRankings: await ctx.db
      .query("players")
      .filter(q => q.neq(q.field("worldRanking"), undefined))
      .count(),
    lastImport: await getLastImportTime(),
    dataIntegrity: await checkDataIntegrity(),
  };
};
```

## Best Practices

### Import Guidelines
1. Always validate data before import
2. Use batch processing for large datasets
3. Implement proper error handling
4. Keep import logs for audit trail
5. Test imports in development first

### Data Quality
1. Standardize player names
2. Validate country codes
3. Check date formats
4. Verify numeric values
5. Handle missing data gracefully

### Performance Tips
1. Import during off-peak hours
2. Use appropriate batch sizes
3. Monitor Convex usage limits
4. Implement caching where possible
5. Clean up old data regularly

## Troubleshooting

### Common Issues

#### Issue: Import timeout
**Solution**: Reduce batch size to 10-15 records

#### Issue: Duplicate players
**Solution**: Check by name before creating new player

#### Issue: Wrong rankings
**Solution**: Use Ultimate Fix tool to reset and reimport

#### Issue: Memory errors
**Solution**: Process data in smaller chunks

#### Issue: Convex read limit
**Solution**: Use `.take()` to limit query results

## Security Considerations

1. **Authentication Required**: All admin functions require authentication
2. **Role-Based Access**: Only admin users can import/delete data
3. **Input Validation**: Sanitize all imported data
4. **Audit Logging**: Track all data modifications
5. **Backup Before Delete**: Always backup before bulk operations