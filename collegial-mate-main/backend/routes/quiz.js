import express from 'express';
import { body, validationResult } from 'express-validator';
import { sheets } from '../config/googleAPIs.js';

const router = express.Router();

// Mock quiz database (in production, use MongoDB/PostgreSQL)
let quizzes = [
  {
    id: 1,
    userId: 1,
    title: 'Computer Science Fundamentals',
    description: 'Basic concepts of computer science and programming',
    subject: 'Computer Science',
    difficulty: 'beginner',
    timeLimit: 30, // minutes
    totalQuestions: 10,
    googleSheetId: null,
    isPublished: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

let questions = [
  {
    id: 1,
    quizId: 1,
    question: 'What is the primary function of RAM?',
    type: 'multiple-choice',
    options: [
      'Long-term storage',
      'Temporary storage',
      'Processing data',
      'Displaying graphics'
    ],
    correctAnswer: 1,
    explanation: 'RAM (Random Access Memory) is used for temporary storage of data that the CPU needs to access quickly.',
    points: 10
  }
];

let quizAttempts = [
  {
    id: 1,
    quizId: 1,
    userId: 1,
    score: 80,
    totalQuestions: 10,
    correctAnswers: 8,
    timeTaken: 25, // minutes
    completedAt: new Date(),
    answers: [
      { questionId: 1, selectedAnswer: 1, isCorrect: true }
    ]
  }
];

// Validation middleware
const validateQuiz = [
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim(),
  body('subject').trim().isLength({ min: 1 }),
  body('difficulty').isIn(['beginner', 'intermediate', 'advanced']),
  body('timeLimit').isInt({ min: 1, max: 180 }),
  body('totalQuestions').isInt({ min: 1, max: 100 })
];

const validateQuestion = [
  body('question').trim().isLength({ min: 1 }),
  body('type').isIn(['multiple-choice', 'true-false', 'short-answer']),
  body('options').isArray({ min: 2, max: 6 }),
  body('correctAnswer').isInt({ min: 0 }),
  body('points').isInt({ min: 1, max: 100 })
];

// Get all quizzes for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const userQuizzes = quizzes.filter(quiz => quiz.userId === userId);
    
    res.json({
      quizzes: userQuizzes,
      total: userQuizzes.length
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// Get a specific quiz
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const quiz = quizzes.find(q => q.id === parseInt(id) && q.userId === userId);
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    // Get questions for this quiz
    const quizQuestions = questions.filter(q => q.quizId === parseInt(id));
    
    res.json({ 
      quiz,
      questions: quizQuestions,
      totalQuestions: quizQuestions.length
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// Create a new quiz
router.post('/', validateQuiz, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, subject, difficulty, timeLimit, totalQuestions } = req.body;
    const userId = req.user.userId;

    let googleSheetId = null;

    // Create Google Sheet for quiz data
    try {
      const sheet = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `Quiz: ${title}`,
          },
          sheets: [
            {
              properties: {
                title: 'Quiz Info',
                gridProperties: {
                  rowCount: 10,
                  columnCount: 5,
                },
              },
            },
            {
              properties: {
                title: 'Questions',
                gridProperties: {
                  rowCount: 100,
                  columnCount: 10,
                },
              },
            },
            {
              properties: {
                title: 'Results',
                gridProperties: {
                  rowCount: 100,
                  columnCount: 8,
                },
              },
            },
          ],
        },
      });

      googleSheetId = sheet.data.spreadsheetId;

      // Set up headers for questions sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId: googleSheetId,
        range: 'Questions!A1:J1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [
            ['ID', 'Question', 'Type', 'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Correct Answer', 'Explanation', 'Points']
          ]
        }
      });

      // Set up headers for results sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId: googleSheetId,
        range: 'Results!A1:H1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [
            ['Attempt ID', 'User ID', 'Score', 'Total Questions', 'Correct Answers', 'Time Taken', 'Completed At', 'Answers']
          ]
        }
      });

    } catch (googleError) {
      console.error('Google Sheets creation error:', googleError);
      // Continue without Google integration if it fails
    }

    const newQuiz = {
      id: quizzes.length + 1,
      userId,
      title,
      description,
      subject,
      difficulty,
      timeLimit,
      totalQuestions,
      googleSheetId,
      isPublished: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    quizzes.push(newQuiz);

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz: newQuiz
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// Add question to quiz
router.post('/:id/questions', validateQuestion, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { question, type, options, correctAnswer, explanation, points } = req.body;
    const userId = req.user.userId;

    // Verify quiz exists and belongs to user
    const quiz = quizzes.find(q => q.id === parseInt(id) && q.userId === userId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const newQuestion = {
      id: questions.length + 1,
      quizId: parseInt(id),
      question,
      type,
      options,
      correctAnswer,
      explanation,
      points
    };

    questions.push(newQuestion);

    // Update Google Sheet if available
    if (quiz.googleSheetId) {
      try {
        const rowData = [
          newQuestion.id,
          newQuestion.question,
          newQuestion.type,
          ...newQuestion.options,
          newQuestion.correctAnswer,
          newQuestion.explanation,
          newQuestion.points
        ];

        await sheets.spreadsheets.values.append({
          spreadsheetId: quiz.googleSheetId,
          range: 'Questions!A:J',
          valueInputOption: 'RAW',
          requestBody: {
            values: [rowData]
          }
        });
      } catch (googleError) {
        console.error('Google Sheets update error:', googleError);
      }
    }

    res.status(201).json({
      message: 'Question added successfully',
      question: newQuestion
    });
  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({ error: 'Failed to add question' });
  }
});

// Take a quiz
router.post('/:id/take', async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;
    const userId = req.user.userId;

    // Verify quiz exists
    const quiz = quizzes.find(q => q.id === parseInt(id));
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Get quiz questions
    const quizQuestions = questions.filter(q => q.quizId === parseInt(id));
    if (quizQuestions.length === 0) {
      return res.status(400).json({ error: 'Quiz has no questions' });
    }

    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    const gradedAnswers = [];

    answers.forEach(answer => {
      const question = quizQuestions.find(q => q.id === answer.questionId);
      if (question) {
        const isCorrect = answer.selectedAnswer === question.correctAnswer;
        if (isCorrect) {
          correctAnswers++;
          totalPoints += question.points;
        }
        gradedAnswers.push({
          questionId: answer.questionId,
          selectedAnswer: answer.selectedAnswer,
          isCorrect
        });
      }
    });

    const score = Math.round((correctAnswers / quizQuestions.length) * 100);

    // Create quiz attempt
    const attempt = {
      id: quizAttempts.length + 1,
      quizId: parseInt(id),
      userId,
      score,
      totalQuestions: quizQuestions.length,
      correctAnswers,
      totalPoints,
      timeTaken: 0, // You can calculate this from start/end time
      completedAt: new Date(),
      answers: gradedAnswers
    };

    quizAttempts.push(attempt);

    // Update Google Sheet if available
    if (quiz.googleSheetId) {
      try {
        const rowData = [
          attempt.id,
          attempt.userId,
          attempt.score,
          attempt.totalQuestions,
          attempt.correctAnswers,
          attempt.totalPoints,
          attempt.completedAt.toISOString(),
          JSON.stringify(attempt.answers)
        ];

        await sheets.spreadsheets.values.append({
          spreadsheetId: quiz.googleSheetId,
          range: 'Results!A:H',
          valueInputOption: 'RAW',
          requestBody: {
            values: [rowData]
          }
        });
      } catch (googleError) {
        console.error('Google Sheets update error:', googleError);
      }
    }

    res.json({
      message: 'Quiz completed successfully',
      attempt,
      feedback: gradedAnswers.map(answer => {
        const question = quizQuestions.find(q => q.id === answer.questionId);
        return {
          questionId: answer.questionId,
          question: question.question,
          selectedAnswer: answer.selectedAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect: answer.isCorrect,
          explanation: question.explanation
        };
      })
    });
  } catch (error) {
    console.error('Take quiz error:', error);
    res.status(500).json({ error: 'Failed to complete quiz' });
  }
});

// Get quiz results
router.get('/:id/results', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Verify quiz exists and belongs to user
    const quiz = quizzes.find(q => q.id === parseInt(id) && q.userId === userId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quizAttempts = quizAttempts.filter(attempt => attempt.quizId === parseInt(id));

    // Calculate statistics
    const totalAttempts = quizAttempts.length;
    const averageScore = totalAttempts > 0 
      ? quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts 
      : 0;

    res.json({
      quiz,
      attempts: quizAttempts,
      statistics: {
        totalAttempts,
        averageScore: Math.round(averageScore * 100) / 100,
        highestScore: totalAttempts > 0 ? Math.max(...quizAttempts.map(a => a.score)) : 0,
        lowestScore: totalAttempts > 0 ? Math.min(...quizAttempts.map(a => a.score)) : 0
      }
    });
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({ error: 'Failed to fetch quiz results' });
  }
});

// Publish/unpublish quiz
router.patch('/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const quizIndex = quizzes.findIndex(q => q.id === parseInt(id) && q.userId === userId);
    
    if (quizIndex === -1) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    quizzes[quizIndex].isPublished = !quizzes[quizIndex].isPublished;
    quizzes[quizIndex].updatedAt = new Date();

    res.json({
      message: `Quiz ${quizzes[quizIndex].isPublished ? 'published' : 'unpublished'}`,
      quiz: quizzes[quizIndex]
    });
  } catch (error) {
    console.error('Publish quiz error:', error);
    res.status(500).json({ error: 'Failed to update quiz' });
  }
});

// Get public quizzes
router.get('/public/list', async (req, res) => {
  try {
    const publicQuizzes = quizzes.filter(quiz => quiz.isPublished);
    
    res.json({
      quizzes: publicQuizzes,
      total: publicQuizzes.length
    });
  } catch (error) {
    console.error('Get public quizzes error:', error);
    res.status(500).json({ error: 'Failed to fetch public quizzes' });
  }
});

export default router;
