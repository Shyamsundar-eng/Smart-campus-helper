import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

// Google API credentials
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';

// Initialize OAuth2 client
export const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

// Google Drive API
export const drive = google.drive({
  version: 'v3',
  auth: oauth2Client
});

// Google Calendar API
export const calendar = google.calendar({
  version: 'v3',
  auth: oauth2Client
});

// Google Sheets API
export const sheets = google.sheets({
  version: 'v4',
  auth: oauth2Client
});

// Google Natural Language API
export const language = google.language({
  version: 'v1',
  auth: oauth2Client
});

// Google Classroom API (for educational features)
export const classroom = google.classroom({
  version: 'v1',
  auth: oauth2Client
});

// Google Docs API
export const docs = google.docs({
  version: 'v1',
  auth: oauth2Client
});

// Google Slides API
export const slides = google.slides({
  version: 'v1',
  auth: oauth2Client
});

// Initialize Google APIs
export const initializeGoogleAPIs = () => {
  try {
    // Set default scopes for the APIs we'll use
    const SCOPES = [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/classroom.courses.readonly',
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/presentations'
    ];

    console.log('🔐 Google APIs initialized successfully');
    console.log('📚 Available APIs: Drive, Calendar, Sheets, Classroom, Docs, Slides');
    
    return {
      oauth2Client,
      drive,
      calendar,
      sheets,
      language,
      classroom,
      docs,
      slides,
      scopes: SCOPES
    };
  } catch (error) {
    console.error('❌ Error initializing Google APIs:', error.message);
    throw error;
  }
};

// Generate OAuth URL for user authentication
export const generateAuthUrl = () => {
  const SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/presentations'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
};

// Get tokens from authorization code
export const getTokensFromCode = async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
  } catch (error) {
    console.error('Error getting tokens:', error);
    throw error;
  }
};

// Set credentials for API calls
export const setCredentials = (tokens) => {
  oauth2Client.setCredentials(tokens);
};

// Check if credentials are valid
export const checkCredentials = async () => {
  try {
    await drive.files.list({ pageSize: 1 });
    return true;
  } catch (error) {
    return false;
  }
};

export default {
  initializeGoogleAPIs,
  generateAuthUrl,
  getTokensFromCode,
  setCredentials,
  checkCredentials,
  oauth2Client,
  drive,
  calendar,
  sheets,
  language,
  classroom,
  docs,
  slides
};
