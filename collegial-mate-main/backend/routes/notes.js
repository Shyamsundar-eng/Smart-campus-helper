import express from 'express';
import { body, validationResult } from 'express-validator';
import { drive, docs } from '../config/googleAPIs.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Mock notes database (in production, use MongoDB/PostgreSQL)
let notes = [
  {
    id: 1,
    userId: 1,
    title: 'Introduction to Computer Science',
    content: 'Basic concepts of programming and algorithms',
    type: 'text',
    googleDriveId: null,
    tags: ['computer-science', 'programming'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Validation middleware
const validateNote = [
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('content').trim().isLength({ min: 1 }),
  body('type').isIn(['text', 'document', 'presentation']),
  body('tags').optional().isArray()
];

// Get all notes for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware
    
    const userNotes = notes.filter(note => note.userId === userId);
    
    res.json({
      notes: userNotes,
      total: userNotes.length
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Get a specific note
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const note = notes.find(n => n.id === parseInt(id) && n.userId === userId);
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json({ note });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// Create a new note
router.post('/', validateNote, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, type, tags } = req.body;
    const userId = req.user.userId;

    let googleDriveId = null;

    // If it's a document type, create in Google Drive
    if (type === 'document') {
      try {
        // Create a new Google Doc
        const doc = await docs.documents.create({
          requestBody: {
            title: title,
            body: {
              content: [
                {
                  paragraph: {
                    elements: [
                      {
                        textRun: {
                          content: content
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }
        });

        googleDriveId = doc.data.documentId;
        
        // Move to user's folder (you'd create a proper folder structure)
        await drive.files.update({
          fileId: googleDriveId,
          requestBody: {
            name: title,
            parents: [] // You can specify folder ID here
          }
        });

      } catch (googleError) {
        console.error('Google Docs creation error:', googleError);
        // Continue without Google integration if it fails
      }
    }

    const newNote = {
      id: notes.length + 1,
      userId,
      title,
      content,
      type,
      googleDriveId,
      tags: tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    notes.push(newNote);

    res.status(201).json({
      message: 'Note created successfully',
      note: newNote
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update a note
router.put('/:id', validateNote, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, content, tags } = req.body;
    const userId = req.user.userId;

    const noteIndex = notes.findIndex(n => n.id === parseInt(id) && n.userId === userId);
    
    if (noteIndex === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Update Google Doc if it exists
    if (notes[noteIndex].googleDriveId) {
      try {
        await docs.documents.batchUpdate({
          documentId: notes[noteIndex].googleDriveId,
          requestBody: {
            requests: [
              {
                replaceAllText: {
                  containsText: {
                    text: notes[noteIndex].content
                  },
                  replaceText: content
                }
              }
            ]
          }
        });
      } catch (googleError) {
        console.error('Google Docs update error:', googleError);
      }
    }

    // Update local note
    notes[noteIndex] = {
      ...notes[noteIndex],
      title,
      content,
      tags: tags || notes[noteIndex].tags,
      updatedAt: new Date()
    };

    res.json({
      message: 'Note updated successfully',
      note: notes[noteIndex]
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete a note
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const noteIndex = notes.findIndex(n => n.id === parseInt(id) && n.userId === userId);
    
    if (noteIndex === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Delete from Google Drive if it exists
    if (notes[noteIndex].googleDriveId) {
      try {
        await drive.files.delete({
          fileId: notes[noteIndex].googleDriveId
        });
      } catch (googleError) {
        console.error('Google Drive delete error:', googleError);
      }
    }

    // Remove from local array
    notes.splice(noteIndex, 1);

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Upload file to Google Drive
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, mimetype, buffer } = req.file;
    const userId = req.user.userId;

    // Upload to Google Drive
    const fileMetadata = {
      name: originalname,
      parents: [] // You can specify folder ID here
    };

    const media = {
      mimeType: mimetype,
      body: buffer
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink'
    });

    // Create note entry
    const newNote = {
      id: notes.length + 1,
      userId,
      title: originalname,
      content: `File uploaded: ${originalname}`,
      type: 'file',
      googleDriveId: file.data.id,
      fileUrl: file.data.webViewLink,
      tags: ['uploaded-file'],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    notes.push(newNote);

    res.status(201).json({
      message: 'File uploaded successfully',
      note: newNote,
      file: {
        id: file.data.id,
        name: file.data.name,
        webViewLink: file.data.webViewLink
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Search notes
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const userId = req.user.userId;

    const searchResults = notes.filter(note => 
      note.userId === userId &&
      (note.title.toLowerCase().includes(query.toLowerCase()) ||
       note.content.toLowerCase().includes(query.toLowerCase()) ||
       note.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
    );

    res.json({
      results: searchResults,
      total: searchResults.length,
      query
    });
  } catch (error) {
    console.error('Search notes error:', error);
    res.status(500).json({ error: 'Failed to search notes' });
  }
});

// Get notes by tag
router.get('/tag/:tag', async (req, res) => {
  try {
    const { tag } = req.params;
    const userId = req.user.userId;

    const taggedNotes = notes.filter(note => 
      note.userId === userId &&
      note.tags.includes(tag)
    );

    res.json({
      notes: taggedNotes,
      total: taggedNotes.length,
      tag
    });
  } catch (error) {
    console.error('Get notes by tag error:', error);
    res.status(500).json({ error: 'Failed to fetch notes by tag' });
  }
});

export default router;
