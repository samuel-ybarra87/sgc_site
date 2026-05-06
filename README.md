# SGC Database

A fictional Stargate Command personnel and mission records system inspired by the TV series _Stargate SG-1_. Built as a portfolio project to demonstrate full-stack development and professional testing practices.

The in-universe premise: NORAD has contracted a developer to digitize the SGC's personnel and mission files into a clean, accessible web application.

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Supabase (PostgreSQL, REST API)
- **Testing:** Vitest, React Testing Library, userEvent
- **CI/CD:** GitHub Actions

## Features

- Full CRUD for SGC personnel records
- Role-aware display (military rank abbreviations vs civilian titles)
- Enum-enforced data integrity (rank, status, prefix, personnel type)
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
  personnel.spec.ts
  testUtils.ts
src/
  lib/
    mockData.ts           # Temp values for tests
    paths.ts              # paths and routes for easier management
    rankAbbreviations.ts  # Military rank lookup (Air Force specific)
    supabase.ts           # Supabase client
  mocks/
    handlers.ts
    server.ts
  pages/
    PersonnelList.tsx
    PersonnelDetail.tsx
    PersonnelForm.tsx
  test/
    integration/
      PersonnelDetail.integration.test.tsx
      PersonnelForm.integration.test.tsx
      PersonnelList.integration.test.tsx
    PersonnelDetail.test.tsx
    PersonnelForm.test.tsx
    PersonnelList.test.tsx
    setup.ts
    testUtils.ts
```

## Development Roadmap

- [x] Personnel CRUD
- [x] Unit tests
- [x] CI/CD pipeline
- [x] Integration tests with MSW
- [x] E2E tests with Playwright
- [x] Teams schema
- [ ] Teams CRUD
- [ ] Teams test suite
- [ ] Mission Records schema
- [ ] Mission records CRUD
- [ ] Mission test suite
- [ ] GitHub Pages deployment
- [ ] Styling
- [ ] Role-based access control