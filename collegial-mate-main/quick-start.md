# 🚀 Collegial Mate - Quick Start Guide

Get your college management system up and running in minutes!

## 📋 What You'll Get

- **Frontend**: React + TypeScript + Tailwind CSS + Shadcn/ui
- **Backend**: Node.js + Express + Google APIs integration
- **Features**: Notes, Reminders, Quiz, Chat, Marketplace, Dashboard
- **APIs**: Google Drive, Calendar, Sheets, Natural Language, Classroom

## ⚡ Quick Start (5 minutes)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd collegial-mate-main

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Backend Setup

```bash
cd backend

# Copy environment file
cp env.example .env

# Edit .env with your Google API credentials
# (See Google API Setup section below)

# Start the backend
npm run dev
```

Your backend will be running on `http://localhost:5000`

### 3. Frontend Setup

```bash
# In a new terminal, from the root directory
npm run dev
```

Your frontend will be running on `http://localhost:5173`

### 4. Test Everything

```bash
# Test the backend (in backend directory)
node test.js
```

## 🔐 Google API Setup (Required)

### Step 1: Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable these APIs:
   - Google Drive API
   - Google Calendar API
   - Google Sheets API
   - Google Natural Language API
   - Google Classroom API

### Step 2: OAuth2 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Create OAuth 2.0 Client ID
3. Add redirect URI: `http://localhost:5000/api/auth/google/callback`
4. Copy Client ID and Client Secret

### Step 3: Update .env
```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
JWT_SECRET=your-super-secret-key
```

## 🧪 Test Your Setup

### Backend Health Check
```bash
curl http://localhost:5000/health
```

### Frontend
Open `http://localhost:5173` in your browser

### API Test
```bash
# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User","role":"student"}'
```

## 📱 Available Features

| Feature | Status | API Endpoint |
|---------|--------|--------------|
| ✅ User Authentication | Ready | `/api/auth/*` |
| ✅ Notes Management | Ready | `/api/notes/*` |
| ✅ Reminders & Calendar | Ready | `/api/reminders/*` |
| ✅ Quiz System | Ready | `/api/quiz/*` |
| ✅ AI Chat | Ready | `/api/chat/*` |
| ✅ Marketplace | Ready | `/api/marketplace/*` |
| ✅ Dashboard | Ready | `/api/dashboard/*` |

## 🔧 Development Commands

### Backend
```bash
cd backend
npm run dev          # Development mode with auto-reload
npm start            # Production mode
npm test             # Run tests
```

### Frontend
```bash
npm run dev          # Development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 📁 Project Structure

```
collegial-mate-main/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── pages/             # Page components
│   └── ...
├── backend/                # Node.js backend
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── config/            # Configuration files
│   └── ...
├── FRONTEND_INTEGRATION.md # Frontend integration guide
└── README.md              # Detailed documentation
```

## 🚨 Common Issues & Solutions

### Backend won't start
- Check if port 5000 is available
- Verify `.env` file exists and has correct values
- Ensure all dependencies are installed

### Google API errors
- Verify API credentials in `.env`
- Check if APIs are enabled in Google Cloud Console
- Ensure redirect URI matches exactly

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check CORS configuration
- Ensure API endpoints are correct

### Authentication issues
- Check JWT token in localStorage
- Verify token expiration
- Ensure Authorization header is set correctly

## 🔄 Next Steps

1. **Customize the UI**: Modify components in `src/components/`
2. **Add new features**: Create new routes in `backend/routes/`
3. **Database integration**: Replace mock data with MongoDB/PostgreSQL
4. **Deploy**: Use Heroku, Vercel, or your preferred platform

## 📚 Documentation

- [Backend API Docs](./backend/README.md)
- [Frontend Integration Guide](./FRONTEND_INTEGRATION.md)
- [Google API Setup](./backend/README.md#google-api-setup)

## 🆘 Need Help?

1. Check the documentation above
2. Look at the example code in the guides
3. Test individual endpoints with curl/Postman
4. Check browser console and backend logs

## 🎯 What's Next?

- [ ] Add real-time notifications
- [ ] Implement file upload progress
- [ ] Add advanced analytics
- [ ] Create mobile app
- [ ] Add collaborative features
- [ ] Implement advanced AI features

---

**🎉 Congratulations!** You now have a fully functional college management system with Google APIs integration!

**Happy coding! 🚀**
