# Village Management Platform Development Guidelines

Auto-generated from all feature plans. **Last updated**: 2025-01-10

## Active Technologies
- TypeScript with Next.js 14+ App Router + React 18+ + TailwindCSS + Supabase (001-define-navigation-paths)

## Project Structure
```
src/
├── components/
│   └── navigation/           # New navigation components
│       ├── Navigation.tsx    # Main navigation component
│       ├── NavigationItem.tsx
│       ├── NavigationGroup.tsx
│       └── index.ts
├── lib/
│   └── navigation/           # New navigation logic
│       ├── navigationConfig.ts    # Role-based navigation definitions
│       ├── navigationUtils.ts     # Navigation helper functions
│       └── types.ts              # Navigation type definitions
├── hooks/
│   └── useNavigation.tsx     # Existing hook to be enhanced
└── types/
    └── navigation.ts         # Navigation TypeScript interfaces

tests/
├── components/
│   └── navigation/           # Navigation component tests
├── lib/
│   └── navigation/           # Navigation logic tests
└── integration/
    └── navigation-rbac.test.ts   # Role-based access integration tests
```

## Commands
npm test; npm run lint

## Code Style
TypeScript: Follow standard conventions

## Recent Changes
- 001-define-navigation-paths: Added TypeScript with Next.js 14+ App Router + React 18+ + TailwindCSS + Supabase

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->