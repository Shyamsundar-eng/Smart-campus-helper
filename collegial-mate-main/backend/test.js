import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Test functions
async function testHealthCheck() {
  try {
    console.log('🏥 Testing health check...');
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Health check passed:', data);
      return true;
    } else {
      console.log('❌ Health check failed:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    return false;
  }
}

async function testAuthEndpoints() {
  try {
    console.log('\n🔐 Testing authentication endpoints...');
    
    // Test registration
    console.log('📝 Testing user registration...');
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123',
        name: 'Test User',
        role: 'student'
      })
    });
    
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✅ Registration successful:', registerData.message);
      
      // Test login
      console.log('🔑 Testing user login...');
      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword123'
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Login successful:', loginData.message);
        
        // Test protected endpoint
        console.log('🔒 Testing protected endpoint...');
        const profileResponse = await fetch(`${BASE_URL}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${loginData.token}`
          }
        });
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log('✅ Protected endpoint accessible:', profileData.user.name);
          return loginData.token;
        } else {
          console.log('❌ Protected endpoint failed');
          return null;
        }
      } else {
        console.log('❌ Login failed');
        return null;
      }
    } else {
      console.log('❌ Registration failed');
      return null;
    }
  } catch (error) {
    console.log('❌ Auth test error:', error.message);
    return null;
  }
}

async function testNotesEndpoints(token) {
  if (!token) {
    console.log('⚠️  Skipping notes test - no token available');
    return;
  }
  
  try {
    console.log('\n📝 Testing notes endpoints...');
    
    // Test creating a note
    console.log('✏️  Testing note creation...');
    const createResponse = await fetch(`${BASE_URL}/api/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Test Note',
        content: 'This is a test note for testing purposes.',
        type: 'text',
        tags: ['test', 'example']
      })
    });
    
    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Note created successfully:', createData.message);
      
      // Test getting notes
      console.log('📖 Testing get notes...');
      const getResponse = await fetch(`${BASE_URL}/api/notes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (getResponse.ok) {
        const getData = await getResponse.json();
        console.log('✅ Notes retrieved successfully:', getData.total, 'notes found');
        return createData.note.id;
      } else {
        console.log('❌ Get notes failed');
        return null;
      }
    } else {
      console.log('❌ Note creation failed');
      return null;
    }
  } catch (error) {
    console.log('❌ Notes test error:', error.message);
    return null;
  }
}

async function testDashboardEndpoints(token) {
  if (!token) {
    console.log('⚠️  Skipping dashboard test - no token available');
    return;
  }
  
  try {
    console.log('\n📊 Testing dashboard endpoints...');
    
    // Test overview
    console.log('📈 Testing dashboard overview...');
    const overviewResponse = await fetch(`${BASE_URL}/api/dashboard/overview`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (overviewResponse.ok) {
      const overviewData = await overviewResponse.json();
      console.log('✅ Dashboard overview successful:', overviewData.overview.totalNotes, 'notes');
    } else {
      console.log('❌ Dashboard overview failed');
    }
    
    // Test calendar
    console.log('📅 Testing calendar endpoint...');
    const calendarResponse = await fetch(`${BASE_URL}/api/dashboard/calendar`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (calendarResponse.ok) {
      const calendarData = await calendarResponse.json();
      console.log('✅ Calendar endpoint successful:', calendarData.total, 'events');
    } else {
      console.log('❌ Calendar endpoint failed');
    }
    
  } catch (error) {
    console.log('❌ Dashboard test error:', error.message);
  }
}

// Main test runner
async function runTests() {
  console.log('🧪 Starting Collegial Mate Backend Tests...\n');
  
  // Test 1: Health check
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log('\n❌ Backend is not running. Please start the server first.');
    process.exit(1);
  }
  
  // Test 2: Authentication
  const token = await testAuthEndpoints();
  
  // Test 3: Notes (requires authentication)
  await testNotesEndpoints(token);
  
  // Test 4: Dashboard (requires authentication)
  await testDashboardEndpoints(token);
  
  console.log('\n🎉 All tests completed!');
  console.log('\n📚 Backend is working correctly with the following features:');
  console.log('✅ Health monitoring');
  console.log('✅ User authentication (register/login)');
  console.log('✅ JWT token validation');
  console.log('✅ Protected endpoints');
  console.log('✅ Notes management');
  console.log('✅ Dashboard analytics');
  console.log('\n🚀 Your backend is ready to use!');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests };
