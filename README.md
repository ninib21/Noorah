# Noorah - Babysitting App

## Project Structure
`
Noorah/
├── main.ts          # Main entry point
├── backend/         # Backend API (NestJS)
├── frontend/        # Frontend App (React Native/Expo)
└── github/          # GitHub configuration & CI/CD
`

## Quick Start

### Backend
`ash
cd backend
npm install
npm run start:dev
`

### Frontend
`ash
cd frontend
npm install
npx expo start --web
`

### Full Stack
`ash
npm install
npm run dev
`

## Features
- 🔐 Secure Authentication
- 💳 Payment Processing (Stripe)
- 🔍 Advanced Search
- 📱 Mobile & Web Support
- 🛡️ Military-Grade Security
- 📊 Real-time Analytics

## Tech Stack
- **Backend**: NestJS, TypeScript, PostgreSQL
- **Frontend**: React Native, Expo, TypeScript
- **Security**: JWT, bcrypt, rate limiting
- **Payments**: Stripe Connect
- **Deployment**: Docker, GitHub Actions

## Development
1. Clone repository
2. Install dependencies: 
pm install
3. Start development: 
pm run dev
4. Backend: http://localhost:3001
5. Frontend: http://localhost:3000

## Production
`ash
npm run build
npm run start:prod
`

## License
MIT

