import express from 'express';
import { body, validationResult } from 'express-validator';
import { language, classroom } from '../config/googleAPIs.js';

const router = express.Router();

// Mock chat database (in production, use MongoDB/PostgreSQL)
let chatSessions = [
  {
    id: 1,
    userId: 1,
    title: 'Computer Science Help',
    type: 'academic',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

let chatMessages = [
  {
    id: 1,
    sessionId: 1,
    userId: 1,
    message: 'Can you help me understand recursion?',
    type: 'user',
    sentiment: 'neutral',
    entities: ['recursion', 'computer science'],
    timestamp: new Date(),
    response: {
      message: 'Recursion is a programming concept where a function calls itself...',
      type: 'ai',
      timestamp: new Date(Date.now() + 1000)
    }
  }
];

// Validation middleware
const validateMessage = [
  body('message').trim().isLength({ min: 1, max: 1000 }),
  body('sessionId').optional().isInt(),
  body('type').optional().isIn(['academic', 'general', 'technical'])
];

// Get all chat sessions for a user
router.get('/sessions', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const userSessions = chatSessions.filter(session => session.userId === userId);
    
    res.json({
      sessions: userSessions,
      total: userSessions.length
    });
  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch chat sessions' });
  }
});

// Get messages for a specific chat session
router.get('/sessions/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Verify session belongs to user
    const session = chatSessions.find(s => s.id === parseInt(id) && s.userId === userId);
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    
    const sessionMessages = chatMessages.filter(msg => msg.sessionId === parseInt(id));
    
    res.json({
      session,
      messages: sessionMessages,
      total: sessionMessages.length
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
});

// Create a new chat session
router.post('/sessions', async (req, res) => {
  try {
    const { title, type } = req.body;
    const userId = req.user.userId;

    const newSession = {
      id: chatSessions.length + 1,
      userId,
      title: title || 'New Chat',
      type: type || 'general',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    chatSessions.push(newSession);

    res.status(201).json({
      message: 'Chat session created successfully',
      session: newSession
    });
  } catch (error) {
    console.error('Create chat session error:', error);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
});

// Send a message and get AI response
router.post('/send', validateMessage, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, sessionId, type } = req.body;
    const userId = req.user.userId;

    // Create session if not provided
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const newSession = {
        id: chatSessions.length + 1,
        userId,
        title: message.substring(0, 50) + '...',
        type: type || 'general',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      chatSessions.push(newSession);
      currentSessionId = newSession.id;
    }

    // Analyze message using Google Natural Language API
    let sentiment = 'neutral';
    let entities = [];
    let categories = [];

    try {
      // Analyze sentiment
      const sentimentResponse = await language.documents.analyzeSentiment({
        document: {
          content: message,
          type: 'PLAIN_TEXT'
        }
      });

      const sentimentScore = sentimentResponse.data.documentSentiment.score;
      if (sentimentScore > 0.1) sentiment = 'positive';
      else if (sentimentScore < -0.1) sentiment = 'negative';
      else sentiment = 'neutral';

      // Analyze entities
      const entityResponse = await language.documents.analyzeEntities({
        document: {
          content: message,
          type: 'PLAIN_TEXT'
        }
      });

      entities = entityResponse.data.entities.map(entity => entity.name);

      // Analyze content categories
      const categoryResponse = await language.documents.classifyText({
        document: {
          content: message,
          type: 'PLAIN_TEXT'
        }
      });

      categories = categoryResponse.data.categories.map(cat => cat.name);

    } catch (googleError) {
      console.error('Google Natural Language API error:', googleError);
      // Continue without Google analysis if it fails
    }

    // Create user message
    const userMessage = {
      id: chatMessages.length + 1,
      sessionId: currentSessionId,
      userId,
      message,
      type: 'user',
      sentiment,
      entities,
      categories,
      timestamp: new Date()
    };

    chatMessages.push(userMessage);

    // Generate AI response based on message analysis
    const aiResponse = await generateAIResponse(message, sentiment, entities, categories, type);

    // Create AI response message
    const aiMessage = {
      id: chatMessages.length + 1,
      sessionId: currentSessionId,
      userId: 'ai',
      message: aiResponse.message,
      type: 'ai',
      sentiment: 'neutral',
      entities: [],
      timestamp: new Date(),
      response: null
    };

    chatMessages.push(aiMessage);

    // Update session timestamp
    const sessionIndex = chatSessions.findIndex(s => s.id === currentSessionId);
    if (sessionIndex !== -1) {
      chatSessions[sessionIndex].updatedAt = new Date();
    }

    res.json({
      message: 'Message sent successfully',
      userMessage,
      aiResponse: aiMessage,
      sessionId: currentSessionId
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Generate AI response based on message analysis
async function generateAIResponse(message, sentiment, entities, categories, type) {
  try {
    let response = '';

    // Check if it's an academic question
    if (type === 'academic' || categories.some(cat => cat.includes('Education'))) {
      response = await generateAcademicResponse(message, entities);
    } else if (entities.some(entity => ['recursion', 'algorithm', 'programming'].includes(entity.toLowerCase()))) {
      response = generateProgrammingResponse(message, entities);
    } else if (sentiment === 'negative') {
      response = generateSupportiveResponse(message);
    } else {
      response = generateGeneralResponse(message);
    }

    return {
      message: response,
      type: 'ai'
    };
  } catch (error) {
    console.error('AI response generation error:', error);
    return {
      message: 'I apologize, but I\'m having trouble processing your request right now. Please try again later.',
      type: 'ai'
    };
  }
}

// Generate academic response using Google Classroom API
async function generateAcademicResponse(message, entities) {
  try {
    // You could integrate with Google Classroom to get course materials
    // For now, provide general academic guidance
    if (entities.some(entity => ['recursion', 'algorithm'].includes(entity.toLowerCase()))) {
      return `Great question about ${entities[0]}! Recursion is a fundamental programming concept where a function calls itself to solve a problem. It's particularly useful for problems that can be broken down into smaller, similar subproblems. Would you like me to explain a specific example or help you understand how to implement it?`;
    } else if (entities.some(entity => ['math', 'mathematics', 'calculus'].includes(entity.toLowerCase()))) {
      return `I see you're asking about mathematics! Math is the foundation of many computer science concepts. Could you provide more specific details about what you're studying? I can help explain concepts, provide examples, or suggest resources for further learning.`;
    } else {
      return `I'd be happy to help you with your academic question! To provide the most helpful response, could you give me more specific details about what you're studying or what concept you'd like to understand better?`;
    }
  } catch (error) {
    console.error('Academic response generation error:', error);
    return 'I\'d be happy to help you with your academic question! Could you provide more specific details?';
  }
}

// Generate programming-specific response
function generateProgrammingResponse(message, entities) {
  const programmingTopics = {
    'recursion': 'Recursion is a programming technique where a function calls itself. It\'s great for problems like tree traversal, factorial calculation, and divide-and-conquer algorithms.',
    'algorithm': 'Algorithms are step-by-step procedures for solving problems. They can be analyzed for efficiency using Big O notation and are fundamental to computer science.',
    'programming': 'Programming involves writing instructions for computers to execute. It includes concepts like variables, loops, functions, and data structures.'
  };

  for (const entity of entities) {
    const lowerEntity = entity.toLowerCase();
    if (programmingTopics[lowerEntity]) {
      return programmingTopics[lowerEntity];
    }
  }

  return 'I can help you with programming concepts! Could you be more specific about what you\'d like to learn?';
}

// Generate supportive response for negative sentiment
function generateSupportiveResponse(message) {
  const supportiveResponses = [
    'I understand this might be challenging. Let\'s work through it together step by step.',
    'Don\'t worry, learning new concepts can be difficult at first. What specific part are you finding challenging?',
    'It\'s completely normal to feel stuck sometimes. Let me help you break this down into smaller, manageable parts.',
    'I\'m here to help! Let\'s approach this from a different angle. What have you tried so far?'
  ];

  return supportiveResponses[Math.floor(Math.random() * supportiveResponses.length)];
}

// Generate general response
function generateGeneralResponse(message) {
  const generalResponses = [
    'That\'s an interesting question! I\'d be happy to help you explore this topic further.',
    'I can help you with that! Could you provide a bit more context so I can give you the most relevant information?',
    'Great question! Let me think about the best way to explain this concept to you.',
    'I\'m here to help! What specific aspect would you like to focus on?'
  ];

  return generalResponses[Math.floor(Math.random() * generalResponses.length)];
}

// Get chat analytics
router.get('/analytics', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const userMessages = chatMessages.filter(msg => msg.userId === userId);
    
    // Calculate analytics
    const totalMessages = userMessages.length;
    const sentimentBreakdown = {
      positive: userMessages.filter(msg => msg.sentiment === 'positive').length,
      negative: userMessages.filter(msg => msg.sentiment === 'negative').length,
      neutral: userMessages.filter(msg => msg.sentiment === 'neutral').length
    };

    // Get most common entities
    const entityCounts = {};
    userMessages.forEach(msg => {
      msg.entities.forEach(entity => {
        entityCounts[entity] = (entityCounts[entity] || 0) + 1;
      });
    });

    const topEntities = Object.entries(entityCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([entity, count]) => ({ entity, count }));

    res.json({
      analytics: {
        totalMessages,
        sentimentBreakdown,
        topEntities,
        totalSessions: chatSessions.filter(s => s.userId === userId).length
      }
    });
  } catch (error) {
    console.error('Get chat analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch chat analytics' });
  }
});

// Delete a chat session
router.delete('/sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const sessionIndex = chatSessions.findIndex(s => s.id === parseInt(id) && s.userId === userId);
    
    if (sessionIndex === -1) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    // Remove all messages for this session
    const messageIndices = [];
    chatMessages.forEach((msg, index) => {
      if (msg.sessionId === parseInt(id)) {
        messageIndices.push(index);
      }
    });

    // Remove messages in reverse order to maintain indices
    messageIndices.reverse().forEach(index => {
      chatMessages.splice(index, 1);
    });

    // Remove session
    chatSessions.splice(sessionIndex, 1);

    res.json({ message: 'Chat session deleted successfully' });
  } catch (error) {
    console.error('Delete chat session error:', error);
    res.status(500).json({ error: 'Failed to delete chat session' });
  }
});

export default router;
