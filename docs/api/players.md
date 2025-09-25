# Players API Reference

The Players API provides comprehensive access to player data, including profiles, rankings, and follow functionality.

## API Functions

### `getAllPlayers`

Retrieves a list of all players with optional search filtering.

```typescript
// convex/players.ts
export const getAllPlayers = query({
  args: {
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Returns array of players matching search term
  },
});
```

**Parameters:**
- `searchTerm` (optional): String to search player names

**Returns:**
```typescript
Array<{
  _id: Id<"players">,
  name: string,
  firstName: string,
  lastName: string,
  country: string,
  countryCode: string,
  worldRanking?: number,
  photoUrl?: string,
  // ... other player fields
}>
```

**Usage Example:**
```typescript
const players = useQuery(api.players.getAllPlayers, {
  searchTerm: "Tiger"
});
```

### `getPlayer`

Retrieves detailed information for a specific player.

```typescript
export const getPlayer = query({
  args: {
    playerId: v.id("players"),
  },
  handler: async (ctx, args) => {
    // Returns single player object
  },
});
```

**Parameters:**
- `playerId`: Unique player ID

**Returns:**
```typescript
{
  _id: Id<"players">,
  name: string,
  firstName: string,
  lastName: string,
  country: string,
  countryCode: string,
  birthDate?: string,
  birthPlace?: string,
  college?: string,
  swing?: string,
  turnedPro?: number,
  height?: string,
  weight?: string,
  photoUrl?: string,
  worldRanking?: number,
  tourRanking?: number,
  espnId?: string,
}
```

### `getPlayerStats`

Retrieves statistics for a player in a specific year.

```typescript
export const getPlayerStats = query({
  args: {
    playerId: v.id("players"),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    // Returns player statistics for the year
  },
});
```

**Parameters:**
- `playerId`: Unique player ID
- `year`: Year for statistics (e.g., 2024)

**Returns:**
```typescript
{
  _id: Id<"playerStats">,
  playerId: Id<"players">,
  year: number,
  avgSgApp?: number,
  fairwaysHit?: number,
  avgPutts?: number,
  tournaments?: number,
  wins?: number,
  top10s?: number,
  earnings?: number,
}
```

### `getWorldRankings`

Retrieves the current world golf rankings.

```typescript
export const getWorldRankings = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Returns top-ranked players
  },
});
```

**Parameters:**
- `limit` (optional): Number of players to return (default: 200)

**Returns:**
```typescript
Array<{
  _id: Id<"players">,
  name: string,
  country: string,
  countryCode: string,
  worldRanking: number,
  photoUrl?: string,
}>
```

### `followPlayer`

Allows a user to follow a player.

```typescript
export const followPlayer = mutation({
  args: {
    playerId: v.id("players"),
  },
  handler: async (ctx, args) => {
    // Creates a follow relationship
  },
});
```

**Parameters:**
- `playerId`: Player to follow

**Returns:**
```typescript
{
  success: boolean,
  message: string,
}
```

**Authentication Required:** Yes

### `unfollowPlayer`

Removes a player from user's followed list.

```typescript
export const unfollowPlayer = mutation({
  args: {
    playerId: v.id("players"),
  },
  handler: async (ctx, args) => {
    // Removes follow relationship
  },
});
```

**Parameters:**
- `playerId`: Player to unfollow

**Returns:**
```typescript
{
  success: boolean,
  message: string,
}
```

**Authentication Required:** Yes

### `getUserFollows`

Gets all players followed by the current user.

```typescript
export const getUserFollows = query({
  handler: async (ctx) => {
    // Returns array of followed players
  },
});
```

**Parameters:** None

**Returns:**
```typescript
Array<{
  _id: Id<"players">,
  name: string,
  country: string,
  worldRanking?: number,
  followedAt: number,
}>
```

**Authentication Required:** Yes

### `isFollowing`

Checks if the current user is following a specific player.

```typescript
export const isFollowing = query({
  args: {
    playerId: v.id("players"),
  },
  handler: async (ctx, args) => {
    // Returns follow status
  },
});
```

**Parameters:**
- `playerId`: Player to check

**Returns:**
```typescript
boolean
```

**Authentication Required:** Yes

### `updatePlayerBio`

Updates biographical information for a player (Admin only).

```typescript
export const updatePlayerBio = mutation({
  args: {
    playerId: v.id("players"),
    data: v.object({
      birthDate: v.optional(v.string()),
      birthPlace: v.optional(v.string()),
      college: v.optional(v.string()),
      swing: v.optional(v.string()),
      turnedPro: v.optional(v.number()),
      height: v.optional(v.string()),
      weight: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    // Updates player bio
  },
});
```

**Parameters:**
- `playerId`: Player to update
- `data`: Object containing fields to update

**Returns:**
```typescript
{
  success: boolean,
  updatedPlayer: Player,
}
```

**Authentication Required:** Yes (Admin only)

## Usage Examples

### React Component Example

```tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function PlayerProfile({ playerId }) {
  // Fetch player data
  const player = useQuery(api.players.getPlayer, { playerId });
  const stats = useQuery(api.players.getPlayerStats, {
    playerId,
    year: 2024
  });
  const isFollowing = useQuery(api.players.isFollowing, { playerId });

  // Follow/unfollow mutations
  const followPlayer = useMutation(api.players.followPlayer);
  const unfollowPlayer = useMutation(api.players.unfollowPlayer);

  const handleFollowToggle = async () => {
    if (isFollowing) {
      await unfollowPlayer({ playerId });
    } else {
      await followPlayer({ playerId });
    }
  };

  if (!player) return <div>Loading...</div>;

  return (
    <div>
      <h1>{player.name}</h1>
      <p>World Ranking: #{player.worldRanking}</p>
      <p>Country: {player.country}</p>

      {stats && (
        <div>
          <p>2024 Earnings: ${stats.earnings}</p>
          <p>Wins: {stats.wins}</p>
        </div>
      )}

      <button onClick={handleFollowToggle}>
        {isFollowing ? "Unfollow" : "Follow"}
      </button>
    </div>
  );
}
```

### Search Implementation

```tsx
function PlayerSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const players = useQuery(api.players.getAllPlayers, {
    searchTerm: searchTerm || undefined
  });

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search players..."
      />

      <div>
        {players?.map(player => (
          <div key={player._id}>
            {player.name} - #{player.worldRanking}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Error Handling

All API functions may throw errors in the following cases:

- `Player not found`: When the specified player ID doesn't exist
- `Authentication required`: When accessing protected endpoints without auth
- `Permission denied`: When non-admin users attempt admin operations
- `Invalid parameters`: When required parameters are missing or invalid

Handle errors appropriately in your application:

```tsx
try {
  await followPlayer({ playerId });
} catch (error) {
  console.error("Failed to follow player:", error);
  // Show error message to user
}
```

## Performance Considerations

- Use search indexes for name searches
- World rankings are indexed for fast sorting
- Follow relationships are indexed by user and player
- Consider pagination for large result sets
- Cache frequently accessed player data on the client

## Rate Limiting

- No explicit rate limits on queries
- Mutations are subject to Convex's standard rate limits
- Batch operations should be throttled to avoid timeouts