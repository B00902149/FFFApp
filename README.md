# Faith-Fueled Fitness (FFF) App

Mobile fitness app integrating workouts, nutrition tracking, health metrics, and faith-based motivation.

## Tech Stack

- **Frontend**: React Native (Expo)
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas
- **State**: Redux Toolkit
- **Navigation**: React Navigation

## Project Structure
```
FFFApp/
├── backend/           # Node.js API
│   ├── models/        # Mongoose schemas
│   ├── routes/        # API endpoints
│   └── server.js
├── src/
│   ├── components/    # Reusable UI
│   ├── screens/       # App screens
│   ├── navigation/    # Navigation config
│   └── store/         # Redux store
└── App.tsx
```

## Setup
```bash
# Install dependencies
npm install
cd backend && npm install

# Start frontend
expo start

# Start backend (separate terminal)
cd backend && node server.js
```

## Environment Variables

Create `.env` in `/backend`:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

## Features

- ✅ Authentication (JWT)
- ✅ Dashboard with health tiles
- ✅ Exercise database & search
- ✅ Nutrition logging
- ✅ Community feed
- ✅ Daily Bible verses
- ✅ Workout tracking & ratings

## Development Timeline

MVP target: 4-8 months

## License


MIT
