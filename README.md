# 🚌 KIIT SmartBus

Real-time campus bus tracking system for KIIT University, Bhubaneswar.

## Tech Stack
- **React + Vite** — Frontend
- **Firebase Auth** — Secure login/register
- **Firestore** — User data, bus data, approvals
- **Firebase Realtime DB** — Live GPS coordinates
- **Leaflet.js + OpenStreetMap** — Real interactive map (free, no API key)

## Setup Instructions

### 1. Install dependencies
```bash
npm install
```

### 2. Run development server
```bash
npm run dev
```
Open http://localhost:5173

### 3. Build for production
```bash
npm run build
```

### 4. Deploy to Firebase Hosting (optional)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # set dist as public folder, SPA: yes
npm run build
firebase deploy
```

## Firebase Rules (important!)

### Firestore Rules
Go to Firebase Console → Firestore → Rules → paste this:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null;
    }
    match /buses/{busId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### Realtime Database Rules
Go to Firebase Console → Realtime Database → Rules → paste this:
```json
{
  "rules": {
    "gps": {
      "$vehicleId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

## Project Structure
```
kiit-smartbus/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx              # Entry point
    ├── App.jsx               # Root router + Firebase auth
    ├── data/
    │   └── constants.js      # CAMPUSES, STATUS_CONFIG, BUS_SPEED_KMH
    ├── utils/
    │   ├── db.js             # Firebase helpers (auth, firestore, rtdb)
    │   └── eta.js            # haversineKm, calcETA, etaColor
    ├── styles/
    │   └── globalStyles.js   # Global CSS string
    ├── components/
    │   ├── KIITLogo.jsx
    │   ├── AnimatedBg.jsx
    │   ├── CampusMap.jsx     # Leaflet real map
    │   └── ETAComponents.jsx # LocationBanner + ETABadge
    └── pages/
        ├── LandingPage.jsx
        ├── RoleSelectPage.jsx
        ├── AuthPage.jsx
        ├── StudentDashboard.jsx
        ├── DriverDashboard.jsx
        └── AdminDashboard.jsx
```

## How It Works

### Student
1. Register/Login → see live map with real bus positions
2. Allow location → get live ETA for each bus
3. Tap any bus on map → see details + arrival time

### Driver
1. Register → wait for admin approval
2. Once approved → tap "Start GPS" → location streams live
3. Update seat availability (Empty/Few Seats/Full)
4. Destination is assigned by admin

### Admin
1. Register/Login → see fleet overview
2. Approve new driver registrations
3. Assign destinations to drivers anytime
4. Monitor online drivers and active routes
