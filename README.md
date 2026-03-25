# BloodConnect — AI-Powered Emergency Blood Donor Matching

## Project Structure
```
blood/
├── backend/     Node.js + Express API
├── web/         React.js web dashboard
├── mobile/      React Native (Expo) mobile app
└── ml/          Python FastAPI ML service
```

## Setup

### 1. Backend
```bash
cd backend
cp .env.sample .env   # fill in your credentials
npm install
npm run dev
```

### 2. ML Service
```bash
cd ml
pip install -r requirements.txt
python train_models.py        # trains and saves models
uvicorn main:app --port 8000  # starts ML API
```

### 3. Web
```bash
cd web
cp .env.sample .env
npm install
npm start
```

### 4. Mobile
```bash
cd mobile
npm install
npx expo start
```

## Environment Variables
- Copy `.env.sample` to `.env` in `backend/` and `web/`
- Fill in MongoDB URI, JWT secret, Twilio, Firebase credentials

## Default Ports
- Backend: 5000
- ML Service: 8000
- Web: 3000
- Mobile: Expo DevTools
