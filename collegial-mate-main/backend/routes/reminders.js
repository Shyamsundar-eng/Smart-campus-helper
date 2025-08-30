import express from 'express';
import { body, validationResult } from 'express-validator';
import { calendar } from '../config/googleAPIs.js';

const router = express.Router();

// Mock reminders database (in production, use MongoDB/PostgreSQL)
let reminders = [
  {
    id: 1,
    userId: 1,
    title: 'Submit Assignment',
    description: 'Submit the final project assignment',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    priority: 'high',
    category: 'academic',
    googleCalendarId: null,
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Validation middleware
const validateReminder = [
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim(),
  body('dueDate').isISO8601(),
  body('priority').isIn(['low', 'medium', 'high']),
  body('category').isIn(['academic', 'personal', 'work', 'other'])
];

// Get all reminders for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const userReminders = reminders.filter(reminder => reminder.userId === userId);
    
    // Sort by due date (earliest first)
    userReminders.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    res.json({
      reminders: userReminders,
      total: userReminders.length
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// Get a specific reminder
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const reminder = reminders.find(r => r.id === parseInt(id) && r.userId === userId);
    
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    
    res.json({ reminder });
  } catch (error) {
    console.error('Get reminder error:', error);
    res.status(500).json({ error: 'Failed to fetch reminder' });
  }
});

// Create a new reminder
router.post('/', validateReminder, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, dueDate, priority, category } = req.body;
    const userId = req.user.userId;

    let googleCalendarId = null;

    // Create Google Calendar event
    try {
      const event = {
        summary: title,
        description: description || '',
        start: {
          dateTime: new Date(dueDate).toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: new Date(new Date(dueDate).getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
          timeZone: 'UTC',
        },
        reminders: {
          useDefault: false,
          overrides: [
            {
              method: 'email',
              minutes: 24 * 60, // 24 hours before
            },
            {
              method: 'popup',
              minutes: 60, // 1 hour before
            },
          ],
        },
        colorId: priority === 'high' ? '11' : priority === 'medium' ? '5' : '10', // Red, Yellow, Green
      };

      const calendarEvent = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      googleCalendarId = calendarEvent.data.id;
    } catch (googleError) {
      console.error('Google Calendar creation error:', googleError);
      // Continue without Google integration if it fails
    }

    const newReminder = {
      id: reminders.length + 1,
      userId,
      title,
      description,
      dueDate: new Date(dueDate),
      priority,
      category,
      googleCalendarId,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    reminders.push(newReminder);

    res.status(201).json({
      message: 'Reminder created successfully',
      reminder: newReminder
    });
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// Update a reminder
router.put('/:id', validateReminder, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, dueDate, priority, category } = req.body;
    const userId = req.user.userId;

    const reminderIndex = reminders.findIndex(r => r.id === parseInt(id) && r.userId === userId);
    
    if (reminderIndex === -1) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    // Update Google Calendar event if it exists
    if (reminders[reminderIndex].googleCalendarId) {
      try {
        const event = {
          summary: title,
          description: description || '',
          start: {
            dateTime: new Date(dueDate).toISOString(),
            timeZone: 'UTC',
          },
          end: {
            dateTime: new Date(new Date(dueDate).getTime() + 60 * 60 * 1000).toISOString(),
            timeZone: 'UTC',
          },
          reminders: {
            useDefault: false,
            overrides: [
              {
                method: 'email',
                minutes: 24 * 60,
              },
              {
                method: 'popup',
                minutes: 60,
              },
            ],
          },
          colorId: priority === 'high' ? '11' : priority === 'medium' ? '5' : '10',
        };

        await calendar.events.update({
          calendarId: 'primary',
          eventId: reminders[reminderIndex].googleCalendarId,
          requestBody: event,
        });
      } catch (googleError) {
        console.error('Google Calendar update error:', googleError);
      }
    }

    // Update local reminder
    reminders[reminderIndex] = {
      ...reminders[reminderIndex],
      title,
      description,
      dueDate: new Date(dueDate),
      priority,
      category,
      updatedAt: new Date()
    };

    res.json({
      message: 'Reminder updated successfully',
      reminder: reminders[reminderIndex]
    });
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

// Delete a reminder
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const reminderIndex = reminders.findIndex(r => r.id === parseInt(id) && r.userId === userId);
    
    if (reminderIndex === -1) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    // Delete from Google Calendar if it exists
    if (reminders[reminderIndex].googleCalendarId) {
      try {
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: reminders[reminderIndex].googleCalendarId,
        });
      } catch (googleError) {
        console.error('Google Calendar delete error:', googleError);
      }
    }

    // Remove from local array
    reminders.splice(reminderIndex, 1);

    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});

// Mark reminder as completed
router.patch('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const reminderIndex = reminders.findIndex(r => r.id === parseInt(id) && r.userId === userId);
    
    if (reminderIndex === -1) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    reminders[reminderIndex].isCompleted = !reminders[reminderIndex].isCompleted;
    reminders[reminderIndex].updatedAt = new Date();

    res.json({
      message: `Reminder ${reminders[reminderIndex].isCompleted ? 'completed' : 'uncompleted'}`,
      reminder: reminders[reminderIndex]
    });
  } catch (error) {
    console.error('Complete reminder error:', error);
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

// Get reminders by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const userId = req.user.userId;

    const categoryReminders = reminders.filter(reminder => 
      reminder.userId === userId && reminder.category === category
    );

    res.json({
      reminders: categoryReminders,
      total: categoryReminders.length,
      category
    });
  } catch (error) {
    console.error('Get reminders by category error:', error);
    res.status(500).json({ error: 'Failed to fetch reminders by category' });
  }
});

// Get upcoming reminders
router.get('/upcoming/:days', async (req, res) => {
  try {
    const { days } = req.params;
    const userId = req.user.userId;
    const daysFromNow = parseInt(days) || 7;

    const upcomingDate = new Date();
    upcomingDate.setDate(upcomingDate.getDate() + daysFromNow);

    const upcomingReminders = reminders.filter(reminder => 
      reminder.userId === userId &&
      !reminder.isCompleted &&
      new Date(reminder.dueDate) <= upcomingDate &&
      new Date(reminder.dueDate) >= new Date()
    );

    // Sort by due date
    upcomingReminders.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    res.json({
      reminders: upcomingReminders,
      total: upcomingReminders.length,
      days: daysFromNow
    });
  } catch (error) {
    console.error('Get upcoming reminders error:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming reminders' });
  }
});

// Get overdue reminders
router.get('/overdue', async (req, res) => {
  try {
    const userId = req.user.userId;
    const now = new Date();

    const overdueReminders = reminders.filter(reminder => 
      reminder.userId === userId &&
      !reminder.isCompleted &&
      new Date(reminder.dueDate) < now
    );

    // Sort by due date (most overdue first)
    overdueReminders.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    res.json({
      reminders: overdueReminders,
      total: overdueReminders.length
    });
  } catch (error) {
    console.error('Get overdue reminders error:', error);
    res.status(500).json({ error: 'Failed to fetch overdue reminders' });
  }
});

export default router;
