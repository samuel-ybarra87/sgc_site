# SGC Database

A fictional Stargate Command personnel and mission records system inspired by the TV series _Stargate SG-1_. Built as a portfolio project to demonstrate full-stack development and professional testing practices.

The in-universe premise: NORAD has contracted a developer to digitize the SGC's personnel and mission files into a clean, accessible web application.

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Backend/Data:** Supabase (PostgreSQL, auth/db/api)
- **Testing:** Vitest, React Testing Library, userEvent
- **CI/CD:** GitHub Actions

## Features

- Full CRUD for SGC personnel records
- Full CRUD for SGC Teams
- Role-aware display (military rank abbreviations vs civilian titles)
- Enum-enforced data integrity
  - Personnel fields (rank, status, prefix, personnel type, role, and team assignment)
  - Teams (commanding_officer)
- Comprehensive unit test suite with mocked Supabase client
- Automated CI pipeline on push to main, staging, and dev branches

## Getting Started

### Prerequisites

- Node.js 22+
- npm

### Installation

```bash
git clone https://github.com/DragonJedi0/sgc_site.git
cd sgc_site
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running Locally

`npm run dev`

### Running Tests

`npm run test:run`
`npm run test:e2e`

## Project Structure

```
e2e/
  interface.ts            # Test Objects for mock entries
  mockData.ts             # Temp values for E2E tests
  personnel.spec.ts
  teams.spec.ts
  testUtils.ts            # Helper functions for E2E tests
src/
  lib/
    mockData.ts           # Temp values for tests
    paths.ts              # paths and routes for easier management
    rankAbbreviations.ts  # Military rank lookup (Air Force specific)
    supabase.ts           # Supabase client
    types.ts              # Test Objects for mock database
  mocks/
    handlers.ts
    server.ts
  pages/
    Homepage.tsx
    PersonnelList.tsx
    PersonnelDetail.tsx
    PersonnelForm.tsx
    TeamDetail.tsx
    TeamForm.tsx
    TeamList.tsx
  test/
    integration/
      Homepage.integration.test.tesx
      PersonnelDetail.integration.test.tsx
      PersonnelForm.integration.test.tsx
      PersonnelList.integration.test.tsx
      TeamDetail.integration.test.tsx
      TeamForm.integration.test.tsx
      TeamList.integration.test.tsx
    PersonnelDetail.test.tsx
    PersonnelForm.test.tsx
    PersonnelList.test.tsx
    setup.ts
    TeamDetail.test.tsx
    TeamForm.test.tsx
    TeamList.test.tsx
    testUtils.ts
```

## Development Roadmap

- [x] Personnel CRUD
- [x] Unit tests
- [x] CI/CD pipeline
- [x] Integration tests with MSW
- [x] E2E tests with Playwright
- [x] Teams schema
  - [x] Migrate personnel to use team_id foreign key
- [x] Teams CRUD
  - [x] Teams unit test suite
  - [x] Teams integration test suite
  - [ ] Teams e2e test suite (In Prgrogress)
- [ ] Mission Records schema
  - [ ] Create many to many relationship between personnel and teams tables
- [ ] Mission records CRUD
  - [ ] Missions unit test suite
  - [ ] Missions integration test suite
  - [ ] Missions e2e test suite
- [ ] GitHub Pages deployment
- [ ] Styling
- [ ] Role-based access control

## Why I Built This

I built this project to improve my testing skills using tools that are more common in modern web development than Behat. My goal was to get practical experience with unit, integration, and end-to-end testing while building a full-stack CRUD application.