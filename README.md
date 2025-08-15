# NannyRadar Babysitting App

A comprehensive babysitting application with diamond-solid security, built with React Native frontend and NestJS backend.

## Project Structure

```
├── frontend/           # React Native mobile application
│   ├── src/           # Main source code
│   ├── assets/        # Images, icons, and other assets
│   ├── e2e/           # End-to-end tests
│   └── ...            # React Native configuration files
├── backend/           # NestJS API server
│   ├── src/           # Backend source code
│   ├── test/          # Backend tests
│   └── ...            # NestJS configuration files
├── docs/              # Documentation files
│   ├── README.md      # Main documentation
│   ├── SECURITY_IMPLEMENTATION_README.md
│   ├── TESTING_GUIDE.md
│   └── ...            # Other documentation
├── tests/             # Integration and stress tests
│   ├── *.test.js      # Test files
│   └── *.json         # Test reports
├── scripts/           # Setup and utility scripts
├── infrastructure/    # Docker and deployment configs
└── package.json       # Root package.json with workspace configuration
```

## Quick Start

### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0
- React Native development environment
- PostgreSQL database

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

2. Set up environment variables:
```bash
# Copy environment files
cp backend/env.example backend/.env
# Edit the .env file with your configuration
```

3. Start the development servers:

**Backend:**
```bash
npm run start:backend
```

**Frontend:**
```bash
npm run start:frontend
```

## Available Scripts

- `npm run install:all` - Install dependencies for all packages
- `npm run start:frontend` - Start the React Native development server
- `npm run start:backend` - Start the NestJS development server
- `npm run build:frontend` - Build the frontend for production
- `npm run build:backend` - Build the backend for production
- `npm run test:all` - Run all tests (frontend + backend)
- `npm run test:e2e` - Run integration tests
- `npm run lint:all` - Run linting for all packages

## Development

### Frontend Development
The frontend is a React Native application located in the `frontend/` directory. It includes:
- React Navigation for routing
- Redux Toolkit for state management
- TypeScript for type safety
- Comprehensive UI components

### Backend Development
The backend is a NestJS application located in the `backend/` directory. It includes:
- RESTful API endpoints
- JWT authentication
- PostgreSQL database integration
- Comprehensive security features

### Testing
- Unit tests are located within each package
- Integration tests are in the `tests/` directory
- E2E tests are in `frontend/e2e/`

## Documentation

Detailed documentation is available in the `docs/` directory:
- [Security Implementation](docs/SECURITY_IMPLEMENTATION_README.md)
- [Testing Guide](docs/TESTING_GUIDE.md)
- [Local Development Setup](docs/LOCAL_DEVELOPMENT_SETUP.md)
- [API Documentation](docs/AI_SYSTEMS_README.md)

## Contributing

1. Follow the established project structure
2. Write tests for new features
3. Update documentation as needed
4. Follow the coding standards defined in each package

## License

MIT License - see LICENSE file for details
