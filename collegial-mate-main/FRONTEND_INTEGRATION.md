# Frontend Integration Guide

This guide explains how to integrate your existing React frontend with the new Collegial Mate backend.

## 🔗 API Base URL

Update your frontend to use the new backend API:

```javascript
// In your API configuration
const API_BASE_URL = 'http://localhost:5000/api';
```

## 🔐 Authentication Integration

### 1. Update Login Component

```tsx
// src/components/Login.tsx or similar
import { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store token in localStorage or context
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        const error = await response.json();
        alert(error.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default Login;
```

### 2. Update Registration Component

```tsx
// src/components/Register.tsx
import { useState } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student'
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Registration successful! Please login.');
        // Redirect to login
        window.location.href = '/login';
      } else {
        const error = await response.json();
        alert(error.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <input
        type="text"
        placeholder="Full Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        required
      />
      <select
        value={formData.role}
        onChange={(e) => setFormData({...formData, role: e.target.value})}
      >
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
```

## 📝 Notes Integration

### Update Notes Component

```tsx
// src/components/Notes.tsx
import { useState, useEffect } from 'react';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState({ title: '', content: '', type: 'text' });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newNote),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes([...notes, data.note]);
        setNewNote({ title: '', content: '', type: 'text' });
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  if (loading) return <div>Loading notes...</div>;

  return (
    <div>
      <h2>My Notes</h2>
      
      {/* Create Note Form */}
      <form onSubmit={createNote}>
        <input
          type="text"
          placeholder="Note Title"
          value={newNote.title}
          onChange={(e) => setNewNote({...newNote, title: e.target.value})}
          required
        />
        <textarea
          placeholder="Note Content"
          value={newNote.content}
          onChange={(e) => setNewNote({...newNote, content: e.target.value})}
          required
        />
        <select
          value={newNote.type}
          onChange={(e) => setNewNote({...newNote, type: e.target.value})}
        >
          <option value="text">Text</option>
          <option value="document">Document</option>
          <option value="presentation">Presentation</option>
        </select>
        <button type="submit">Create Note</button>
      </form>

      {/* Notes List */}
      <div>
        {notes.map((note) => (
          <div key={note.id} className="note-item">
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <span className="note-type">{note.type}</span>
            <span className="note-date">
              {new Date(note.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notes;
```

## 📅 Reminders Integration

### Update Reminders Component

```tsx
// src/components/Reminders.tsx
import { useState, useEffect } from 'react';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    category: 'academic'
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/reminders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReminders(data.reminders);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  const createReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newReminder),
      });

      if (response.ok) {
        const data = await response.json();
        setReminders([...reminders, data.reminder]);
        setNewReminder({
          title: '',
          description: '',
          dueDate: '',
          priority: 'medium',
          category: 'academic'
        });
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
    }
  };

  return (
    <div>
      <h2>My Reminders</h2>
      
      {/* Create Reminder Form */}
      <form onSubmit={createReminder}>
        <input
          type="text"
          placeholder="Reminder Title"
          value={newReminder.title}
          onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
          required
        />
        <textarea
          placeholder="Description"
          value={newReminder.description}
          onChange={(e) => setNewReminder({...newReminder, description: e.target.value})}
        />
        <input
          type="datetime-local"
          value={newReminder.dueDate}
          onChange={(e) => setNewReminder({...newReminder, dueDate: e.target.value})}
          required
        />
        <select
          value={newReminder.priority}
          onChange={(e) => setNewReminder({...newReminder, priority: e.target.value})}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          value={newReminder.category}
          onChange={(e) => setNewReminder({...newReminder, category: e.target.value})}
        >
          <option value="academic">Academic</option>
          <option value="personal">Personal</option>
          <option value="work">Work</option>
          <option value="other">Other</option>
        </select>
        <button type="submit">Create Reminder</button>
      </form>

      {/* Reminders List */}
      <div>
        {reminders.map((reminder) => (
          <div key={reminder.id} className={`reminder-item priority-${reminder.priority}`}>
            <h3>{reminder.title}</h3>
            <p>{reminder.description}</p>
            <span className="due-date">
              Due: {new Date(reminder.dueDate).toLocaleString()}
            </span>
            <span className={`priority priority-${reminder.priority}`}>
              {reminder.priority}
            </span>
            <span className="category">{reminder.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reminders;
```

## 🏪 Marketplace Integration

### Update Marketplace Component

```tsx
// src/components/Marketplace.tsx
import { useState, useEffect } from 'react';

const Marketplace = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/marketplace');
      
      if (response.ok) {
        const data = await response.json();
        setItems(data.items);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading marketplace...</div>;

  return (
    <div>
      <h2>Marketplace</h2>
      
      <div className="marketplace-grid">
        {items.map((item) => (
          <div key={item.id} className="marketplace-item">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <div className="item-details">
              <span className="price">${item.price}</span>
              <span className="condition">{item.condition}</span>
              <span className="category">{item.category}</span>
            </div>
            <button onClick={() => window.location.href = `/marketplace/item/${item.id}`}>
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
```

## 📊 Dashboard Integration

### Update Dashboard Component

```tsx
// src/components/Dashboard.tsx
import { useState, useEffect } from 'react';

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [calendar, setCalendar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch overview
      const overviewResponse = await fetch('http://localhost:5000/api/dashboard/overview', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json();
        setOverview(overviewData.overview);
      }

      // Fetch calendar
      const calendarResponse = await fetch('http://localhost:5000/api/dashboard/calendar', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (calendarResponse.ok) {
        const calendarData = await calendarResponse.json();
        setCalendar(calendarData.events);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h2>Dashboard</h2>
      
      {/* Overview Stats */}
      {overview && (
        <div className="overview-stats">
          <div className="stat-card">
            <h3>Notes</h3>
            <p>{overview.totalNotes}</p>
          </div>
          <div className="stat-card">
            <h3>Reminders</h3>
            <p>{overview.totalReminders}</p>
          </div>
          <div className="stat-card">
            <h3>Quizzes</h3>
            <p>{overview.activeQuizzes}</p>
          </div>
          <div className="stat-card">
            <h3>Marketplace Items</h3>
            <p>{overview.marketplaceItems}</p>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {overview && (
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          {overview.recentActivity.map((activity, index) => (
            <div key={index} className="activity-item">
              <span className="activity-type">{activity.type}</span>
              <span className="activity-title">{activity.title}</span>
              <span className="activity-time">
                {new Date(activity.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Calendar Events */}
      <div className="calendar-events">
        <h3>Upcoming Events</h3>
        {calendar.map((event) => (
          <div key={event.id} className="calendar-event">
            <h4>{event.title}</h4>
            <p>{event.description}</p>
            <span className="event-time">
              {new Date(event.start).toLocaleString()}
            </span>
            {event.location && (
              <span className="event-location">{event.location}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
```

## 🔧 API Utility Functions

Create a utility file for common API operations:

```typescript
// src/utils/api.ts
const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  // Get auth token
  getToken: () => localStorage.getItem('token'),

  // Make authenticated request
  request: async (endpoint: string, options: RequestInit = {}) => {
    const token = api.getToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return response.json();
  },

  // GET request
  get: (endpoint: string) => api.request(endpoint),

  // POST request
  post: (endpoint: string, data: any) => 
    api.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // PUT request
  put: (endpoint: string, data: any) => 
    api.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // DELETE request
  delete: (endpoint: string) => 
    api.request(endpoint, {
      method: 'DELETE',
    }),
};

export default api;
```

## 🎨 CSS Styling

Add these CSS classes to your existing styles:

```css
/* Note items */
.note-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background: white;
}

.note-type {
  background: #007bff;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 8px;
}

/* Reminder items */
.reminder-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background: white;
}

.priority-high {
  border-left: 4px solid #dc3545;
}

.priority-medium {
  border-left: 4px solid #ffc107;
}

.priority-low {
  border-left: 4px solid #28a745;
}

/* Marketplace items */
.marketplace-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

.marketplace-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background: white;
}

/* Dashboard stats */
.overview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-card h3 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
}

.stat-card p {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}
```

## 🚀 Next Steps

1. **Test the integration** by running both frontend and backend
2. **Add error handling** for network failures
3. **Implement loading states** for better UX
4. **Add form validation** using your existing validation library
5. **Implement real-time updates** using WebSockets (future enhancement)
6. **Add offline support** with service workers (future enhancement)

## 🔍 Troubleshooting

- **CORS errors**: Ensure backend CORS is configured correctly
- **Authentication errors**: Check JWT token storage and expiration
- **API errors**: Verify endpoint URLs and request formats
- **Network errors**: Ensure backend is running on port 5000

## 📚 Additional Resources

- [Backend API Documentation](./backend/README.md)
- [Google API Setup Guide](./backend/README.md#google-api-setup)
- [Express.js Documentation](https://expressjs.com/)
- [JWT Authentication Guide](https://jwt.io/)
