# Journey Builder

This project:
- fetches the action blueprint graph from the mock server
- renders the form nodes as a list
- lets the user inspect a selected form
- traverses direct and transitive dependencies in the DAG
- supports multiple prefill source types

## Tech stack
- React
- TypeScript
- Vite
- Tailwind
- Vitest
- React Testing Library

## Running locally

### 1. Start the mock backend

In the mock server project:

```bash
cd server
npm start
```

The mock server is expected to run on
```bash
http://localhost:3000
```

### 2. Start the frontend

```bash
cd client
npm install
npm run dev
```

### 3. Run tests

```bash
npm test
```

## Architecture overview

### Current source types
- Direct dependency
- Transitive dependency
- Global values

### Adding a new data source
1. Create a new provider in ```src/lib/prefill.ts```
2. Return a section with the option shape
3. Add the provider to ```DEFAULT_PREFILL_SOURCE_PROVIDERS```