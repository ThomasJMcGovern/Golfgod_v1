# GolfGod Documentation

Welcome to the comprehensive documentation for GolfGod - a PGA Tour analytics platform built with Next.js and Convex.

## 📚 Core Documentation

### Essential Guides
- **[Main README](../README.md)** - Project overview, quick start, tech stack
- **[Codebase Guide](./CODEBASE_GUIDE.md)** ⭐ **NEW** - Comprehensive codebase understanding guide
- **[Architecture Visual](./ARCHITECTURE_VISUAL.md)** ⭐ **NEW** - Visual diagrams and system architecture
- **[Database Schema Map](./database/schema-map.md)** - Complete schema reference (9 tables)
- **[Development Guide](./DEVELOPMENT.md)** - Local setup, debugging, common tasks

### API Reference
- **[Course Stats API](./api/course-stats.md)** - Course performance analytics
- **[Import Master Data](./api/import-master-data.md)** - Production data import pipeline

### Administration
- **[Data Management](./admin/data-management.md)** - Database management and import tools
- **[Data Automation Strategy](./DATA_AUTOMATION_STRATEGY.md)** - Future automation roadmap

---

## 🎯 Feature Overview

### Inside the Ropes - Course-Specific Player Intelligence
Deep-dive analytics revealing how players perform at specific golf courses:
- **Tournament-by-Tournament History**: Complete performance records at each venue
- **Course Performance Metrics**: Scoring averages, best/worst rounds, cut percentages
- **Round-by-Round Analysis**: Average scores by round (R1, R2, R3, R4)
- **Weekend vs Early Scoring**: Performance comparison between early rounds and weekend play

### Core Analytics
- **Player Profiles**: Comprehensive bios, photos, career statistics
- **Tournament Database**: 20,745+ tournament results across 200+ players
- **Real-time Rankings**: PGA Tour world rankings and player follows
- **Advanced Filtering**: Searchable dropdowns with type-to-filter functionality

---

## 🗄️ Database Architecture

**9 Core Tables**:
- `players` - Player profiles and metadata
- `courses` - Golf course information
- `tournamentResults` - Historical performance data
- `playerCourseStats` - Aggregated course performance
- `tournamentCourses` - Tournament-to-course mapping
- `pgaTournaments` - Tournament metadata
- `roundStats` - Individual round statistics
- `playerStats` - Annual player statistics
- `userFollows` - User-player relationships

---

## 🛠 Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | Next.js 15 | React framework with App Router |
| **UI Library** | React 19 | Modern React with Server Components |
| **Database** | Convex | Real-time backend-as-a-service |
| **Styling** | Tailwind CSS 4.0 | Utility-first CSS framework |
| **Components** | shadcn/ui | Beautiful, accessible UI components |
| **Language** | TypeScript 5.0 | Type-safe JavaScript |
| **Forms** | react-select | Advanced searchable dropdowns |
| **Package Manager** | Bun | Ultra-fast JavaScript runtime |

---

## 📥 Data Pipeline

```
Master JSON Files (scripts/)
    ↓
Admin UI (/admin/import-master-json)
    ↓
Convex Action (importMasterDataBatch)
    ↓
Batch Processing (100 players at a time)
    ↓
Database Tables (players, courses, tournamentResults)
```

**Active Import System**: `convex/importMasterData.ts`
**Helper Utilities**: `convex/utils/dataProcessing.ts`

---

## 🚀 Quick Links

- **Main README**: [../README.md](../README.md)
- **Convex Dashboard**: [dashboard.convex.dev](https://dashboard.convex.dev)
- **GitHub Issues**: Report issues and feature requests

---

## 📖 Project Structure

```
golfgod_x_convex/
├── app/                          # Next.js App Router pages
│   ├── inside-the-ropes/         # Course-specific player analytics
│   ├── tournaments/pga/          # Tournament browsing & results
│   ├── admin/                    # Admin pages (data management, imports)
│   └── api/                      # API routes (imports, JSON handling)
├── components/                    # React components
│   ├── layout/                   # Dashboard, navigation
│   ├── player/                   # Player-specific components
│   └── ui/                       # shadcn/ui & custom components
├── convex/                       # Convex backend
│   ├── schema.ts                 # Database schema (9 tables)
│   ├── courseStats.ts            # Course analytics queries
│   ├── players.ts                # Player data queries
│   ├── importMasterData.ts       # Batch data import pipeline
│   ├── utils/                    # Helper utilities
│   └── _generated/               # Convex auto-generated types
├── docs/                         # Documentation
│   ├── api/                      # API reference docs
│   └── admin/                    # Admin guides
└── scripts/                      # Data import scripts
```

---

## 📝 Contributing

We welcome contributions! See the main [README](../README.md#contributing) for development workflow and code style guidelines.

---

## 🙏 Acknowledgments

- **PGA Tour** for the incredible sport and data
- **Convex** for the amazing real-time backend platform
- **Vercel** for Next.js and deployment infrastructure
- **shadcn** for the beautiful UI component library

---

**Built with ❤️ by golf fans, for golf fans** 🏌️‍♂️

*Last updated: October 2025*
