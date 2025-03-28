# FragCollection Frontend

A web application for managing your perfume collection, built with React, TypeScript, and Material UI.

## Features

- User authentication
- Manage collections (private and public)
- Track perfume entries (bottles and decants)
- Calculate price per ml and total value
- Fetch perfume information from Fragrantica
- View other users' public collections

## Prerequisites

- Node.js 16+ and npm
- Backend API running (see main project README)

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

3. The app will open in your browser at http://localhost:3000

## Project Structure

- `src/components/` - React components
  - `Collections/` - Collection management components
  - `PerfumeEntries/` - Perfume entry components
- `src/contexts/` - React contexts for state management
- `src/services/` - API services for communicating with the backend

## Available Scripts

- `npm start` - Run the development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run eject` - Eject from create-react-app (not recommended)

## API Configuration

The application is configured to connect to the backend API at `https://localhost:54378/api`. The proxy is set in `package.json`. If you need to change the API URL, modify the `API_URL` constant in `src/services/apiService.ts`.

## Backend Integration

The frontend communicates with the backend using the following services:

- `authApi` - User authentication (login, register, logout)
- `collectionsApi` - Collection management
- `perfumeEntriesApi` - Perfume entry management

## Deployment

To deploy the application for production:

1. Build the app:

```bash
npm run build
```

2. The built files will be in the `build` directory, ready to be served by any static file server.

## Technologies Used

- React 18
- TypeScript
- Material UI 5
- React Router 6
- Axios for API calls
