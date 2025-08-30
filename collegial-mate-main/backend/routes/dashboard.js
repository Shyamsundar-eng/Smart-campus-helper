import express from 'express';
import { calendar, sheets, drive } from '../config/googleAPIs.js';

const router = express.Router();

// Get dashboard overview data
router.get('/overview', async (req, res) => {
  try {
    const userId = req.user.userId;

    // Mock data for now - in production, you'd fetch from your database
    const overview = {
      totalNotes: 15,
      totalReminders: 8,
      activeQuizzes: 3,
      marketplaceItems: 5,
      upcomingDeadlines: 2,
      recentActivity: [
        {
          type: 'note',
          title: 'Updated Computer Science Notes',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
          type: 'reminder',
          title: 'Submit Assignment Due Tomorrow',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
        },
        {
          type: 'quiz',
          title: 'Completed Data Structures Quiz',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        }
      ]
    };

    res.json({ overview });
  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard overview' });
  }
});

// Get calendar events for the next 7 days
router.get('/calendar', async (req, res) => {
  try {
    const userId = req.user.userId;
    const days = parseInt(req.query.days) || 7;

    const timeMin = new Date();
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + days);

    let events = [];

    try {
      // Fetch events from Google Calendar
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      events = response.data.items.map(event => ({
        id: event.id,
        title: event.summary,
        description: event.description,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        location: event.location,
        color: event.colorId
      }));

    } catch (googleError) {
      console.error('Google Calendar error:', googleError);
      // Return mock data if Google Calendar fails
      events = [
        {
          id: 1,
          title: 'Study Group - Algorithms',
          description: 'Weekly study session for algorithms course',
          start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          location: 'Library Study Room 3',
          color: '5'
        },
        {
          id: 2,
          title: 'Assignment Due - Data Structures',
          description: 'Final project submission deadline',
          start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Online',
          color: '11'
        }
      ];
    }

    res.json({
      events,
      total: events.length,
      timeRange: { start: timeMin, end: timeMax }
    });
  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// Get academic progress
router.get('/academic-progress', async (req, res) => {
  try {
    const userId = req.user.userId;

    // Mock academic progress data
    const progress = {
      courses: [
        {
          id: 1,
          name: 'Computer Science Fundamentals',
          code: 'CS101',
          progress: 75,
          grade: 'A-',
          assignments: 8,
          completedAssignments: 6,
          nextDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        },
        {
          id: 2,
          name: 'Data Structures & Algorithms',
          code: 'CS201',
          progress: 60,
          grade: 'B+',
          assignments: 10,
          completedAssignments: 6,
          nextDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: 3,
          name: 'Calculus I',
          code: 'MATH101',
          progress: 90,
          grade: 'A',
          assignments: 12,
          completedAssignments: 11,
          nextDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      ],
      overallProgress: 75,
      averageGrade: 'A-',
      totalCourses: 3,
      completedCourses: 0
    };

    res.json({ progress });
  } catch (error) {
    console.error('Get academic progress error:', error);
    res.status(500).json({ error: 'Failed to fetch academic progress' });
  }
});

// Get study statistics
router.get('/study-stats', async (req, res) => {
  try {
    const userId = req.user.userId;
    const period = req.query.period || 'week'; // week, month, semester

    // Mock study statistics
    const stats = {
      period,
      totalStudyTime: period === 'week' ? 28 : period === 'month' ? 120 : 480, // hours
      averageDailyStudy: period === 'week' ? 4 : period === 'month' ? 4 : 3.2,
      subjects: [
        {
          name: 'Computer Science',
          timeSpent: period === 'week' ? 16 : period === 'month' ? 70 : 280,
          percentage: 57
        },
        {
          name: 'Mathematics',
          timeSpent: period === 'week' ? 8 : period === 'month' ? 35 : 140,
          percentage: 29
        },
        {
          name: 'Other',
          timeSpent: period === 'week' ? 4 : period === 'month' ? 15 : 60,
          percentage: 14
        }
      ],
      studySessions: period === 'week' ? 14 : period === 'month' ? 60 : 240,
      productivityScore: 85
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get study statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch study statistics' });
  }
});

// Get recent files and documents
router.get('/recent-files', async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 10;

    let files = [];

    try {
      // Fetch recent files from Google Drive
      const response = await drive.files.list({
        pageSize: limit,
        fields: 'files(id, name, mimeType, modifiedTime, webViewLink, thumbnailLink)',
        orderBy: 'modifiedTime desc'
      });

      files = response.data.files.map(file => ({
        id: file.id,
        name: file.name,
        type: file.mimeType,
        modifiedTime: file.modifiedTime,
        webViewLink: file.webViewLink,
        thumbnailLink: file.thumbnailLink
      }));

    } catch (googleError) {
      console.error('Google Drive error:', googleError);
      // Return mock data if Google Drive fails
      files = [
        {
          id: '1',
          name: 'Computer Science Notes.pdf',
          type: 'application/pdf',
          modifiedTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          webViewLink: '#',
          thumbnailLink: null
        },
        {
          id: '2',
          name: 'Algorithms Assignment.docx',
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          modifiedTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          webViewLink: '#',
          thumbnailLink: null
        }
      ];
    }

    res.json({
      files: files.slice(0, limit),
      total: files.length
    });
  } catch (error) {
    console.error('Get recent files error:', error);
    res.status(500).json({ error: 'Failed to fetch recent files' });
  }
});

// Get notifications
router.get('/notifications', async (req, res) => {
  try {
    const userId = req.user.userId;
    const unreadOnly = req.query.unread === 'true';

    // Mock notifications
    const notifications = [
      {
        id: 1,
        type: 'reminder',
        title: 'Assignment Due Tomorrow',
        message: 'Data Structures final project is due tomorrow at 11:59 PM',
        isRead: false,
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        priority: 'high'
      },
      {
        id: 2,
        type: 'quiz',
        title: 'New Quiz Available',
        message: 'A new quiz on Algorithms has been published',
        isRead: false,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        priority: 'medium'
      },
      {
        id: 3,
        type: 'marketplace',
        title: 'Item Sold',
        message: 'Your Calculus textbook has been purchased',
        isRead: true,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        priority: 'low'
      }
    ];

    const filteredNotifications = unreadOnly 
      ? notifications.filter(n => !n.isRead)
      : notifications;

    res.json({
      notifications: filteredNotifications,
      total: filteredNotifications.length,
      unreadCount: notifications.filter(n => !n.isRead).length
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.patch('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // In a real app, you'd update the database
    // For now, just return success
    res.json({
      message: 'Notification marked as read',
      notificationId: id
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Get quick actions
router.get('/quick-actions', async (req, res) => {
  try {
    const userId = req.user.userId;

    const quickActions = [
      {
        id: 1,
        title: 'Create Note',
        description: 'Quickly create a new note',
        icon: 'note',
        action: 'create-note',
        color: 'blue'
      },
      {
        id: 2,
        title: 'Set Reminder',
        description: 'Set a new reminder',
        icon: 'reminder',
        action: 'set-reminder',
        color: 'green'
      },
      {
        id: 3,
        title: 'Start Quiz',
        description: 'Take an available quiz',
        icon: 'quiz',
        action: 'start-quiz',
        color: 'purple'
      },
      {
        id: 4,
        title: 'Add Item',
        description: 'List item in marketplace',
        icon: 'marketplace',
        action: 'add-item',
        color: 'orange'
      }
    ];

    res.json({ quickActions });
  } catch (error) {
    console.error('Get quick actions error:', error);
    res.status(500).json({ error: 'Failed to fetch quick actions' });
  }
});

// Get weather and campus info (mock data)
router.get('/campus-info', async (req, res) => {
  try {
    const campusInfo = {
      weather: {
        temperature: 22,
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 12
      },
      campusEvents: [
        {
          id: 1,
          title: 'Career Fair',
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          location: 'Student Center',
          type: 'career'
        },
        {
          id: 2,
          title: 'Study Skills Workshop',
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          location: 'Library',
          type: 'academic'
        }
      ],
      diningHours: {
        mainCafeteria: '7:00 AM - 10:00 PM',
        coffeeShop: '8:00 AM - 8:00 PM',
        library: '24/7'
      }
    };

    res.json({ campusInfo });
  } catch (error) {
    console.error('Get campus info error:', error);
    res.status(500).json({ error: 'Failed to fetch campus info' });
  }
});

export default router;
