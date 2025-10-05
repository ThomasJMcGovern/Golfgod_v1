# Import Master Data API Reference

## Overview

The Master Data Import system (`convex/importMasterData.ts`) is the **production import pipeline** for GolfGod, handling batch imports of 200+ players with 20,745+ tournament results from JSON files.

**Location**: `/convex/importMasterData.ts`
**Helper Utilities**: `/convex/utils/dataProcessing.ts`
**Admin UI**: `/app/admin/import-master-json/page.tsx`

---

## Architecture

```
Master JSON Files (scripts/master_data_batch_*.json)
    ↓
Admin UI (POST request)
    ↓
Convex Action (importMasterDataBatch)
    ↓
Batch Processing (100 players at a time)
    ↓
Database Tables (players, courses, tournamentResults)
```

---

## Key Functions

### `importCourses(masterData)`

**Purpose**: Extract and import unique golf courses from master JSON data.

**Arguments**:
```typescript
{
  masterData: {
    players: Array<{
      tournaments: Array<{
        course_name: string;
        tournament_name: string;
      }>;
    }>;
  }
}
```

**Process**:
1. Extracts unique courses using `extractUniqueCourses()` helper
2. Parses course names to separate venue from variant (e.g., "TPC Sawgrass (THE PLAYERS Stadium Course)")
3. Checks for existing courses by name
4. Inserts new courses with:
   - `name`: Course name (e.g., "TPC Sawgrass")
   - `location`: "Unknown" (to be enriched later)
   - `par`: 72 (default, to be enriched)
   - `type`: Course variant (e.g., "Stadium", "Links")

**Returns**:
```typescript
{
  imported: number;      // Courses added
  existing: number;      // Courses already in DB
  message: string;       // Summary message
}
```

---

### `importPlayers(masterData)`

**Purpose**: Import player profiles and biographical data.

**Arguments**:
```typescript
{
  masterData: {
    players: Array<{
      player_id: string;         // ESPN ID
      player_name: string;       // Full name
      country_code: string;      // "USA", "GBR", etc.
      country_name: string;      // "United States", "England"
    }>;
  }
}
```

**Process**:
1. Checks for existing players by name (search index)
2. Creates new players with:
   - Name parsing (firstName, lastName)
   - Country information
   - ESPN ID
3. Updates existing players with ESPN ID if missing

**Deduplication**: Uses `search_name` index for fuzzy matching

**Returns**:
```typescript
{
  imported: number;      // New players added
  updated: number;       // Existing players updated
  skipped: number;       // Duplicates skipped
  message: string;
}
```

---

### `importTournamentResults(masterData)`

**Purpose**: Batch import tournament results for all players.

**Arguments**:
```typescript
{
  masterData: {
    players: Array<{
      player_id: string;
      player_name: string;
      tournaments: Array<{
        tournament_name: string;
        course_name: string;
        year: number;
        position: string;           // "1", "T9", "MC", "WD"
        rounds: number[];           // [67, 70, 69, 67]
        total_score: number;        // 273
        score_to_par: string;       // "-15", "+3", "E"
        earnings: string;           // "$1,782,000"
      }>;
    }>;
  }
}
```

**Process**:
1. Finds player by name (with fuzzy search)
2. Parses tournament data:
   - Earnings: "$1,782,000" → 1782000
   - Score to par: "-15" → -15, "E" → 0
   - Position: Validates against patterns (T9, MC, WD, etc.)
3. Checks for duplicates (by playerId + year + tournament + date)
4. Inserts new tournament results

**Batch Size**: 100 players at a time to avoid Convex limits

**Returns**:
```typescript
{
  imported: number;      // Results added
  skipped: number;       // Duplicates skipped
  errors: string[];      // Error messages
  message: string;
}
```

---

### `importMasterDataBatch(file1Data, file2Data)`

**Purpose**: **Main entry point** for batch import of both master JSON files.

**Arguments**:
```typescript
{
  file1Data: MasterDataStructure;  // master_data_batch_1.json
  file2Data: MasterDataStructure;  // master_data_batch_2.json
}
```

**Execution Steps**:
1. **Step 1**: Import all courses from both files
2. **Step 2**: Import all players from both files
3. **Step 3**: Import tournament results from both files (batched)

**Returns**:
```typescript
{
  courses: {
    imported: number;
    existing: number;
  };
  players: {
    imported: number;
    updated: number;
  };
  tournamentResults: {
    imported: number;
    skipped: number;
    errors: string[];
  };
  message: string;
}
```

---

## Helper Utilities (`convex/utils/dataProcessing.ts`)

### `parseCourseInfo(courseNameRaw)`
Extracts course name and variant from raw string.

```typescript
parseCourseInfo("TPC Sawgrass (THE PLAYERS Stadium Course)")
// Returns: { name: "TPC Sawgrass", variant: "THE PLAYERS Stadium Course" }
```

### `parseEarnings(earningsStr)`
Converts earnings string to integer.

```typescript
parseEarnings("$1,782,000")  // Returns: 1782000
```

### `parseScoreToPar(scoreStr)`
Converts score-to-par string to number.

```typescript
parseScoreToPar("-15")  // Returns: -15
parseScoreToPar("E")    // Returns: 0
parseScoreToPar("+3")   // Returns: 3
```

### `cleanPosition(position)`
Validates and cleans position strings.

```typescript
cleanPosition("T9")      // Returns: "T9"
cleanPosition("MC")      // Returns: "MC"
cleanPosition("invalid") // Returns: "Unknown"
```

### `madeCut(position, rounds)`
Determines if player made the cut.

```typescript
madeCut("MC", [74, 72])       // Returns: false
madeCut("1", [67, 70, 69, 67]) // Returns: true
```

---

## Data Quality Notes

### Known Issues

1. **Course Locations**: Default to "Unknown"
   - **Cause**: Master JSON has `course_location: null`
   - **Solution**: Manual enrichment or scraper update

2. **Course Par**: Defaults to 72
   - **Cause**: Not included in master JSON
   - **Solution**: Manual updates for non-72 par courses

3. **Missing Scores**: Some tournaments lack round-by-round scores
   - **Impact**: Scorecard shows "-" instead of "67-70-69-67"
   - **Frequency**: ~10% of results

### Data Validation

**Position Patterns**:
- Numeric: `1`, `23`, `145`
- Tied: `T9`, `T25`, `T50`
- Missed Cut: `MC`, `CUT`
- Special: `WD` (withdrawal), `DQ` (disqualified)

**Cut Detection**:
- Explicit: Position contains "MC", "CUT", "WD"
- Implicit: Only 2 rounds played (didn't qualify for weekend)

---

## Performance Characteristics

- **Import Time**: ~30-60 seconds for 200 players, 20,745 results
- **Batch Size**: 100 players per batch to avoid Convex read limits
- **Deduplication**: Automatic via name/espnId matching
- **Concurrency**: Sequential batches (no parallel processing)

---

## Error Handling

**Common Errors**:
1. **Player Not Found**: Creates new player with defaults
2. **Course Not Found**: Creates new course with "Unknown" location
3. **Duplicate Tournament**: Skips silently (counted in `skipped`)
4. **Invalid Data**: Logs error, continues processing

**Error Recovery**: All errors are logged but don't stop the import process.

---

## Usage Example

### Via Convex Dashboard

```typescript
// Import both master JSON files
await api.importMasterData.importMasterDataBatch({
  file1Data: /* paste master_data_batch_1.json */,
  file2Data: /* paste master_data_batch_2.json */
})
```

### Via Admin UI

1. Navigate to `/admin/import-master-json`
2. Click "Import Master Data"
3. System automatically loads both batch files from `/scripts/`
4. Monitor progress in real-time
5. Review import summary

---

## Related Files

- **Main Import**: `/convex/importMasterData.ts`
- **Utilities**: `/convex/utils/dataProcessing.ts`
- **Admin UI**: `/app/admin/import-master-json/page.tsx`
- **Data Files**: `/scripts/master_data_batch_1.json`, `/scripts/master_data_batch_2.json`
- **Database Schema**: `/convex/schema.ts`

---

## Migration Notes

**Deprecated Systems** (Removed in refactor):
- ❌ `/convex/imports.ts` - Old CSV import (571 lines)
- ❌ `/convex/importPipeline.ts` - Intermediate JSON pipeline (402 lines)
- ❌ `/app/admin/import-json-pipeline/` - Old admin UI

**Current System**:
- ✅ `/convex/importMasterData.ts` - Production import pipeline
- ✅ `/convex/utils/dataProcessing.ts` - Shared utilities
- ✅ `/app/admin/import-master-json/` - Active admin UI

---

*Last updated: October 2025 (Refactor v2.0)*
