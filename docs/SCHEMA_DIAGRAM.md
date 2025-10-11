# GolfGod Database Schema Diagram

Visual representation of the GolfGod database schema and relationships.

---

## Entity Relationship Diagram

```mermaid
erDiagram
    players ||--o{ tournamentResults : "has results"
    players ||--o{ roundStats : "has rounds"
    players ||--o{ playerCourseStats : "has stats"
    players ||--o{ userFollows : "followed by"

    courses ||--o{ tournamentCourses : "hosts"
    courses ||--o{ tournamentResults : "results at"
    courses ||--o{ roundStats : "rounds at"
    courses ||--o{ playerCourseStats : "stats for"

    tournamentResults ||--o{ roundStats : "contains"

    users ||--o{ userFollows : "follows"

    players {
        id _id PK
        string name "Scottie Scheffler"
        string firstName "Scottie"
        string lastName "Scheffler"
        string country "United States"
        string countryCode "US"
        string birthDate "1996-06-21"
        string birthPlace "Ridgewood, New Jersey"
        string college "University of Texas"
        string swing "Right"
        number turnedPro 2018
        string height "6-3"
        string weight "205"
        string photoUrl
        number worldRanking 1
        number tourRanking 1
        string espnId "10547"
    }

    courses {
        id _id PK
        string name "TPC Scottsdale"
        string location "Scottsdale, Arizona"
        number par 71
        number yardage 7261
        number established 1986
        string designer "Tom Weiskopf"
        string type "Desert"
        string grassType "Bermuda"
        number stimpmeter
    }

    tournamentResults {
        id _id PK
        id playerId FK "→ players"
        string playerName "Denormalized for performance"
        number year 2024
        string date "Jan 4 - 7"
        string tournament "WM Phoenix Open"
        string course "TPC Scottsdale"
        string position "T1"
        array scores "69,72,68,70"
        number totalScore 279
        number toPar -9
        string score "-9"
        string overall "279"
        number earnings 1512000
    }

    roundStats {
        id _id PK
        id playerId FK "→ players"
        id courseId FK "→ courses"
        id tournamentResultId FK "→ tournamentResults"
        number year 2024
        number round 1
        number score 69
        number toPar -2
        string teeTime "AM or PM"
        number fairwaysHit 10
        number fairwaysPossible 14
        number greensHit 14
        number greensPossible 18
        number putts 28
        string scrambling "3/5"
        string sandSaves "2/3"
        number birdies 4
        number pars 13
        number bogeys 1
        number doubleBogeys 0
        number eagles 0
        number sgTotal 2.5
        number sgOtt 0.8
        number sgApp 1.2
        number sgArg 0.3
        number sgPutt 0.2
        number windSpeed 12
        number temperature 72
        string conditions "Sunny"
    }

    playerCourseStats {
        id _id PK
        id playerId FK "→ players"
        id courseId FK "→ courses"
        number roundsPlayed 42
        number scoringAverage 69.2
        number bestScore 63
        number worstScore 76
        number cutsPlayed 12
        number cutsMade 11
        number wins 2
        number top10s 7
        number top25s 10
        number totalEarnings 3024000
        number avgR1Score 70.1
        number avgR2Score 69.8
        number avgR3Score 68.9
        number avgR4Score 68.0
        number avgEarlyScore 69.95
        number avgWeekendScore 68.45
        number avgDrivingDistance 310.5
        number avgDrivingAccuracy 0.65
        number avgGIR 0.72
        number avgPuttsPerRound 28.5
        number avgScrambling 0.61
        number avgSandSaves 0.55
        number avgSgTotal 2.1
        number avgSgOtt 0.7
        number avgSgApp 0.9
        number avgSgArg 0.3
        number avgSgPutt 0.2
        number lastUpdated 1704672000000
        number lastTournamentYear 2024
    }

    tournamentCourses {
        id _id PK
        string tournamentName "WM Phoenix Open"
        id courseId FK "→ courses"
        number yearStart 1987
        number yearEnd "null = current"
        boolean isPrimary true
    }

    userFollows {
        id _id PK
        string userId FK "→ users (auth)"
        id playerId FK "→ players"
        number followedAt 1704672000000
    }

    pgaTournaments {
        id _id PK
        string tournament_id "2024_wm_phoenix_open"
        string name "WM Phoenix Open"
        number year 2024
        string dates_raw "Feb 1 - 4, 2024"
        string start_date "Feb 1"
        string end_date "Feb 4"
        string winner_name "Scottie Scheffler"
        number winner_espn_id 10547
        string winner_profile_url
        string winning_score "263 (-21)"
        number prize_money 9300000
        string status "completed or scheduled"
        string espn_tournament_id
        string espn_leaderboard_url
        string scraped_at "2024-01-15T12:00:00Z"
        string previous_winner_name "For scheduled tournaments"
        number previous_winner_espn_id
        string previous_winner_profile_url
    }
```

---

## Data Flow Diagram

```mermaid
flowchart TD
    A[ESPN/PGA Tour API] --> B[Python/JS Import Scripts]
    B --> C[tournamentResults]
    C --> D[roundStats]
    D --> E[playerCourseStats - AGGREGATED]

    C --> F[Inside the Ropes UI]
    D --> F
    E --> F

    G[courses] --> H[tournamentCourses]
    H --> C

    style C fill:#e1f5e1
    style D fill:#fff4e1
    style E fill:#e1e8f5
    style F fill:#f5e1e8

    classDef raw fill:#e1f5e1
    classDef detailed fill:#fff4e1
    classDef aggregated fill:#e1e8f5
    classDef ui fill:#f5e1e8
```

**Legend**:
- 🟢 **Green** = Raw tournament data (aggregate scores)
- 🟡 **Yellow** = Detailed round data (individual rounds)
- 🔵 **Blue** = Aggregated career stats
- 🔴 **Pink** = UI/Application layer

---

## Index Reference Diagram

```mermaid
graph LR
    subgraph players
        P1[by_name]
        P2[by_world_ranking]
        P3[search_name]
    end

    subgraph tournamentResults
        TR1[by_player]
        TR2[by_player_year]
        TR3[by_tournament]
        TR4[by_year]
        TR5[by_player_name]
    end

    subgraph roundStats
        RS1[by_player]
        RS2[by_course]
        RS3[by_tournament_result]
        RS4[by_player_course]
        RS5[by_year]
    end

    subgraph playerCourseStats
        PCS1[by_player]
        PCS2[by_course]
        PCS3[by_player_course]
    end

    style TR2 fill:#90EE90
    style RS4 fill:#90EE90
    style PCS3 fill:#90EE90

    TR2 -.->|Most Used| U1[Inside the Ropes]
    RS4 -.->|Most Used| U1
    PCS3 -.->|Most Used| U1
```

**Highlighted** = Most frequently used indexes for Inside the Ropes feature

---

## Query Decision Tree

```mermaid
flowchart TD
    START([What data do I need?]) --> Q1{Career stats<br/>at a course?}
    Q1 -->|Yes| T1[playerCourseStats<br/>by_player_course index]
    Q1 -->|No| Q2{Single tournament<br/>result?}

    Q2 -->|Yes| T2[tournamentResults<br/>by_player_year index]
    Q2 -->|No| Q3{Tournament history<br/>at course?}

    Q3 -->|Yes| T3[tournamentResults<br/>by_player index<br/>+ filter by course]
    Q3 -->|No| Q4{Round-by-round<br/>details?}

    Q4 -->|Yes| T4[roundStats<br/>by_player_course index]
    Q4 -->|No| Q5{AM/PM or Thu-Fri/<br/>Sat-Sun splits?}

    Q5 -->|Yes| T5[roundStats<br/>by_player_course index<br/>+ filter by teeTime/round]
    Q5 -->|No| Q6{Tournament<br/>schedule?}

    Q6 -->|Yes| T6[pgaTournaments<br/>by_year index]
    Q6 -->|No| T7[Check DATABASE_MAP.md]

    style T1 fill:#90EE90
    style T4 fill:#FFD700
    style T5 fill:#FFD700
```

---

## Relationship Cardinality

| From Table | To Table | Relationship | Example |
|------------|----------|--------------|---------|
| `players` | `tournamentResults` | **1:Many** | Scottie → 200+ tournaments |
| `players` | `roundStats` | **1:Many** | Scottie → 800+ rounds |
| `players` | `playerCourseStats` | **1:Many** | Scottie → 54 courses |
| `courses` | `playerCourseStats` | **1:Many** | TPC Scottsdale → 200 players |
| `courses` | `tournamentCourses` | **1:Many** | TPC Scottsdale → 1 tournament |
| `tournamentResults` | `roundStats` | **1:4** | 1 tournament → 4 rounds (usually) |

---

## Common Query Patterns

### Pattern 1: Inside the Ropes - Career Stats
```mermaid
sequenceDiagram
    participant UI
    participant DB

    UI->>DB: Query playerCourseStats<br/>by_player_course(scottie, tpc)
    DB-->>UI: Return 1 record<br/>{scoringAvg: 69.2, wins: 2, ...}
    Note over UI,DB: FASTEST - Pre-aggregated
```

### Pattern 2: Inside the Ropes - Tournament History
```mermaid
sequenceDiagram
    participant UI
    participant DB

    UI->>DB: Query tournamentResults<br/>by_player(scottie)
    DB-->>UI: Return ~200 results
    UI->>UI: Filter by course === "TPC Scottsdale"
    Note over UI,DB: Returns ~12 tournaments
```

### Pattern 3: Split Stats - AM vs PM
```mermaid
sequenceDiagram
    participant UI
    participant DB
    participant Calc

    UI->>DB: Query roundStats<br/>by_player_course(scottie, tpc)
    DB-->>UI: Return ~48 rounds
    UI->>Calc: Filter teeTime === "AM"
    UI->>Calc: Filter teeTime === "PM"
    Calc-->>UI: AM avg: 70.1<br/>PM avg: 68.5
    Note over UI,Calc: Client-side calculation
```

---

## Data Granularity Levels

```mermaid
flowchart LR
    A[Most Detailed] --> B[roundStats]
    B --> C[Individual rounds<br/>R1, R2, R3, R4]

    D[Medium Detail] --> E[tournamentResults]
    E --> F[Tournament aggregate<br/>scores array]

    G[Most Aggregated] --> H[playerCourseStats]
    H --> I[Career stats<br/>at course]

    style B fill:#fff4e1
    style E fill:#e1f5e1
    style H fill:#e1e8f5
```

---

## Viewing This Diagram

**In VS Code**:
1. Install "Markdown Preview Enhanced" extension
2. Open this file
3. Press `Ctrl+Shift+V` (Windows/Linux) or `Cmd+Shift+V` (Mac)
4. Mermaid diagrams will render automatically

**In GitHub**:
- Mermaid diagrams render natively in GitHub markdown

**Online Viewer**:
- Copy Mermaid code to https://mermaid.live/

---

## Schema Updates

When you modify the schema:
1. ✅ Update `convex/schema.ts`
2. ✅ Update this diagram (`docs/SCHEMA_DIAGRAM.md`)
3. ✅ Update `DATABASE_MAP.md` with new relationships
4. ✅ Commit both files together

---

**Last Updated**: January 2025
**Schema Version**: 1.0
**Diagram Type**: Mermaid ERD
