# Collegial Mate Backend

A comprehensive backend for the Collegial Mate college management system, built with Node.js, Express, and integrated with Google's free APIs.

## 🚀 Features

- **Authentication System**: JWT-based authentication with Google OAuth integration
- **Notes Management**: Create, edit, and organize notes with Google Drive integration
- **Reminders & Calendar**: Schedule reminders with Google Calendar sync
- **Quiz System**: Create and manage quizzes with Google Sheets integration
- **AI Chat**: Intelligent chat system using Google Natural Language API
- **Marketplace**: Buy/sell items with Google Drive for image storage
- **Dashboard**: Comprehensive analytics and overview
- **File Management**: Upload and manage files using Google Drive

## 🛠️ Tech Stack

- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js
- **Authentication**: JWT + Google OAuth2
- **Google APIs**: Drive, Calendar, Sheets, Natural Language, Classroom, Docs, Slides
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express-validator
- **Error Handling**: Custom error handling middleware

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Cloud Platform account
- Google APIs enabled

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd backend
npm install
```

### 2. Google API Setup

#### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Google Drive API
   - Google Calendar API
   - Google Sheets API
   - Google Natural Language API
   - Google Classroom API
   - Google Docs API
   - Google Slides API

#### Step 2: Create OAuth2 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
5. Copy Client ID and Client Secret

#### Step 3: Configure Environment Variables
1. Copy `env.example` to `.env`
2. Fill in your Google API credentials:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
JWT_SECRET=your-super-secret-jwt-key
```

### 3. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth URL
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Notes
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `POST /api/notes/upload` - Upload file
- `GET /api/notes/search/:query` - Search notes
- `GET /api/notes/tag/:tag` - Get notes by tag

### Reminders
- `GET /api/reminders` - Get all reminders
- `POST /api/reminders` - Create reminder
- `PUT /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder
- `PATCH /api/reminders/:id/complete` - Mark complete
- `GET /api/reminders/upcoming/:days` - Get upcoming reminders
- `GET /api/reminders/overdue` - Get overdue reminders

### Quiz
- `GET /api/quiz` - Get all quizzes
- `POST /api/quiz` - Create quiz
- `POST /api/quiz/:id/questions` - Add question
- `POST /api/quiz/:id/take` - Take quiz
- `GET /api/quiz/:id/results` - Get quiz results
- `PATCH /api/quiz/:id/publish` - Publish/unpublish quiz

### Chat
- `GET /api/chat/sessions` - Get chat sessions
- `POST /api/chat/sessions` - Create chat session
- `POST /api/chat/send` - Send message
- `GET /api/chat/analytics` - Get chat analytics

### Marketplace
- `GET /api/marketplace` - Get all items
- `POST /api/marketplace` - Create item
- `POST /api/marketplace/:id/images` - Upload images
- `POST /api/marketplace/:id/purchase` - Purchase item
- `PATCH /api/marketplace/transactions/:id/complete` - Complete transaction

### Dashboard
- `GET /api/dashboard/overview` - Dashboard overview
- `GET /api/dashboard/calendar` - Calendar events
- `GET /api/dashboard/academic-progress` - Academic progress
- `GET /api/dashboard/study-stats` - Study statistics
- `GET /api/dashboard/recent-files` - Recent files
- `GET /api/dashboard/notifications` - Notifications

## 🔐 Google API Integration

### Google Drive API
- **Free Tier**: 15GB storage
- **Features**: File storage, document creation, image hosting
- **Use Cases**: Notes, assignments, study materials

### Google Calendar API
- **Free Tier**: Unlimited
- **Features**: Event creation, reminders, scheduling
- **Use Cases**: Assignment deadlines, study sessions, exams

### Google Sheets API
- **Free Tier**: Unlimited
- **Features**: Data storage, quiz management, analytics
- **Use Cases**: Quiz questions, student progress tracking

### Google Natural Language API
- **Free Tier**: 5,000 requests/month
- **Features**: Sentiment analysis, entity extraction, content classification
- **Use Cases**: Chat analysis, content moderation

### Google Classroom API
- **Free Tier**: Unlimited (read-only)
- **Features**: Course information, assignment details
- **Use Cases**: Academic progress tracking

## 🚀 Getting Started with Frontend

The backend is designed to work seamlessly with the React frontend. Update your frontend API calls to use the new endpoints:

```javascript
// Example API call
const response = await fetch('http://localhost:5000/api/notes', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet Security**: Security headers and protection
- **File Upload Limits**: Configurable file size and type restrictions

## 📊 Database

Currently uses in-memory storage for development. For production, consider:

- **MongoDB**: For flexible document storage
- **PostgreSQL**: For relational data and complex queries
- **Redis**: For caching and session management

## 🧪 Testing

```bash
npm test
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `JWT_SECRET` | JWT signing secret | required |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | required |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | required |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |

## 🚀 Deployment

### Heroku
```bash
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
heroku config:set GOOGLE_CLIENT_ID=your-client-id
heroku config:set GOOGLE_CLIENT_SECRET=your-client-secret
git push heroku main
```

### Docker
```bash
docker build -t collegial-mate-backend .
docker run -p 5000:5000 collegial-mate-backend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## 🔮 Future Enhancements

- [ ] Real-time notifications with WebSockets
- [ ] Advanced analytics and reporting
- [ ] Integration with more Google services
- [ ] Mobile app support
- [ ] Advanced AI features
- [ ] Multi-language support
- [ ] Advanced file management
- [ ] Social features and collaboration tools
