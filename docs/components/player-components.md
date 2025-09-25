# Player Components Documentation

This document covers all player-related React components in the GolfGod application.

## PlayerSelect Component

Advanced player search and selection component with autocomplete functionality.

### Location
`/components/PlayerSelect.tsx`

### Props
```typescript
interface PlayerSelectProps {
  value: Id<"players"> | null;
  onChange: (playerId: Id<"players"> | null) => void;
  placeholder?: string;
  className?: string;
}
```

### Features
- Real-time search with Convex backend
- Country flag emojis
- World ranking display
- Autocomplete dropdown
- Keyboard navigation support

### Usage
```tsx
import PlayerSelect from "@/components/PlayerSelect";

function MyComponent() {
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  return (
    <PlayerSelect
      value={selectedPlayer}
      onChange={setSelectedPlayer}
      placeholder="Search for a player..."
    />
  );
}
```

### Styling
Uses `react-select` with custom styles:
- Dark theme compatible
- Responsive design
- Custom option rendering with flags

## PlayerBio Component

Displays comprehensive player biographical information.

### Location
`/components/PlayerBio.tsx`

### Props
```typescript
interface PlayerBioProps {
  playerId: Id<"players">;
}
```

### Features
- Player avatar/photo
- Biographical details (birth date, college, etc.)
- World and tour rankings
- Follow/unfollow functionality
- Responsive grid layout

### Sections
1. **Header**: Photo, name, country flag
2. **Quick Stats**: Rankings and key metrics
3. **Bio Details**: Personal information
4. **Actions**: Follow button

### Usage
```tsx
import PlayerBio from "@/components/PlayerBio";

function PlayerProfile({ playerId }) {
  return (
    <div>
      <PlayerBio playerId={playerId} />
    </div>
  );
}
```

## PlayerStats Component

Comprehensive player statistics display with tabbed interface.

### Location
`/components/PlayerStats.tsx`

### Props
```typescript
interface PlayerStatsProps {
  playerId: Id<"players">;
}
```

### Features
- ESPN-style tab navigation
- Year-based filtering
- Tournament results table
- Performance metrics
- Career earnings calculator

### Tabs
1. **Overview**: 2024 season statistics
2. **News**: Player news (placeholder)
3. **Bio**: Biographical information
4. **Results**: Tournament history with filtering
5. **Scorecards**: Round details (placeholder)

### Statistics Displayed
- Average Strokes Gained: Approach
- Fairways Hit Percentage
- Average Putts per Round
- Earnings (formatted)
- Tournament count
- Wins and Top 10s

### Result Table Features
```tsx
// Position styling logic
const getPositionStyle = (position: string) => {
  if (position === "1") return "font-bold text-yellow-600";
  if (position.startsWith("T") && parseInt(position.substring(1)) <= 10)
    return "text-green-600";
  if (position === "Missed Cut" || position === "MC")
    return "text-gray-400";
  if (position === "WD" || position === "DQ")
    return "text-red-400";
  return "";
};
```

### Year Filtering
```tsx
<Tabs value={selectedYear} onValueChange={setSelectedYear}>
  <TabsTrigger value="all">All Years</TabsTrigger>
  <TabsTrigger value="2024">2024</TabsTrigger>
  <TabsTrigger value="2023">2023</TabsTrigger>
  {/* Dynamic year tabs based on available data */}
</Tabs>
```

## PlayerRankings Component

Displays world golf rankings in a sortable table.

### Location
`/components/PlayerRankings.tsx`

### Props
```typescript
interface PlayerRankingsProps {
  limit?: number;
  onPlayerSelect?: (playerId: Id<"players">) => void;
}
```

### Features
- Top 200 world rankings
- Country flags
- Clickable rows for player selection
- Responsive table design
- Loading states

### Usage
```tsx
import PlayerRankings from "@/components/PlayerRankings";

function RankingsPage() {
  const handlePlayerSelect = (playerId) => {
    // Navigate to player profile
    router.push(`/players/${playerId}`);
  };

  return (
    <PlayerRankings
      limit={100}
      onPlayerSelect={handlePlayerSelect}
    />
  );
}
```

### Table Structure
```tsx
<table>
  <thead>
    <tr>
      <th>Rank</th>
      <th>Player</th>
      <th>Country</th>
    </tr>
  </thead>
  <tbody>
    {players.map(player => (
      <tr key={player._id} onClick={() => onPlayerSelect(player._id)}>
        <td>#{player.worldRanking}</td>
        <td>{player.name}</td>
        <td>{getFlagEmoji(player.countryCode)} {player.country}</td>
      </tr>
    ))}
  </tbody>
</table>
```

## Common Patterns

### Country Flag Helper
```typescript
const getFlagEmoji = (countryCode: string) => {
  if (!countryCode || countryCode.length !== 2) return "🏴";

  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map(char => 127397 + char.charCodeAt(0));

  return String.fromCodePoint(...codePoints);
};
```

### Currency Formatting
```typescript
const formatEarnings = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
```

### Loading States
```tsx
if (!player) {
  return (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
  );
}
```

## Styling Guidelines

### Color Scheme
- Primary: Red (`text-red-600`, `border-red-600`)
- Success: Green (`text-green-600`)
- Warning: Yellow (`text-yellow-600`)
- Error: Red (`text-red-400`)
- Muted: Gray (`text-gray-400`)

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Overflow handling for tables
- Touch-friendly interactions

### Component Structure
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Component content */}
  </CardContent>
</Card>
```

## Performance Considerations

### Data Fetching
- Use Convex real-time queries
- Implement proper loading states
- Handle errors gracefully
- Cache player data when possible

### Optimization Tips
1. Memoize expensive calculations
2. Use React.memo for pure components
3. Implement virtual scrolling for long lists
4. Lazy load tournament results
5. Debounce search inputs

## Accessibility

### ARIA Labels
```tsx
<button
  aria-label={isFollowing ? "Unfollow player" : "Follow player"}
  onClick={handleFollowToggle}
>
  {isFollowing ? "Following" : "Follow"}
</button>
```

### Keyboard Navigation
- Tab navigation through interactive elements
- Enter/Space to activate buttons
- Arrow keys for dropdown navigation
- Escape to close modals

### Screen Reader Support
- Semantic HTML structure
- Descriptive labels
- Status announcements
- Focus management

## Testing Recommendations

### Unit Tests
```typescript
describe("PlayerBio", () => {
  it("displays player name", () => {
    const player = { name: "Tiger Woods", ... };
    render(<PlayerBio playerId={player._id} />);
    expect(screen.getByText("Tiger Woods")).toBeInTheDocument();
  });

  it("handles follow toggle", async () => {
    // Test follow/unfollow functionality
  });
});
```

### Integration Tests
- Test data fetching with Convex
- Verify tab navigation
- Test search functionality
- Validate form submissions

## Common Issues & Solutions

### Issue: Player photo not loading
```tsx
// Fallback to default avatar
<img
  src={player.photoUrl || "/default-avatar.png"}
  onError={(e) => {
    e.currentTarget.src = "/default-avatar.png";
  }}
/>
```

### Issue: Slow search performance
```tsx
// Debounce search input
const debouncedSearch = useMemo(
  () => debounce(handleSearch, 300),
  []
);
```

### Issue: Large tournament lists
```tsx
// Implement pagination
const ITEMS_PER_PAGE = 20;
const paginatedResults = results.slice(
  page * ITEMS_PER_PAGE,
  (page + 1) * ITEMS_PER_PAGE
);
```