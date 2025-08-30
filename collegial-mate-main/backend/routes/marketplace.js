import express from 'express';
import { body, validationResult } from 'express-validator';
import { drive, sheets } from '../config/googleAPIs.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Mock marketplace database (in production, use MongoDB/PostgreSQL)
let marketplaceItems = [
  {
    id: 1,
    userId: 1,
    title: 'Calculus Textbook',
    description: 'Used calculus textbook in good condition',
    category: 'books',
    price: 25.00,
    condition: 'good',
    images: [],
    googleDriveIds: [],
    googleSheetId: null,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

let transactions = [
  {
    id: 1,
    itemId: 1,
    buyerId: 2,
    sellerId: 1,
    amount: 25.00,
    status: 'completed',
    createdAt: new Date(),
    completedAt: new Date()
  }
];

// Validation middleware
const validateItem = [
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('description').trim().isLength({ min: 1, max: 1000 }),
  body('category').isIn(['books', 'electronics', 'clothing', 'furniture', 'other']),
  body('price').isFloat({ min: 0 }),
  body('condition').isIn(['new', 'like-new', 'good', 'fair', 'poor'])
];

// Get all marketplace items
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, condition } = req.query;
    
    let filteredItems = [...marketplaceItems];

    // Apply filters
    if (category) {
      filteredItems = filteredItems.filter(item => item.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
      );
    }

    if (minPrice) {
      filteredItems = filteredItems.filter(item => item.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
      filteredItems = filteredItems.filter(item => item.price <= parseFloat(maxPrice));
    }

    if (condition) {
      filteredItems = filteredItems.filter(item => item.condition === condition);
    }

    // Only show available items
    filteredItems = filteredItems.filter(item => item.isAvailable);

    res.json({
      items: filteredItems,
      total: filteredItems.length,
      filters: { category, search, minPrice, maxPrice, condition }
    });
  } catch (error) {
    console.error('Get marketplace items error:', error);
    res.status(500).json({ error: 'Failed to fetch marketplace items' });
  }
});

// Get a specific marketplace item
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = marketplaceItems.find(item => item.id === parseInt(id));
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ item });
  } catch (error) {
    console.error('Get marketplace item error:', error);
    res.status(500).json({ error: 'Failed to fetch marketplace item' });
  }
});

// Create a new marketplace item
router.post('/', validateItem, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category, price, condition } = req.body;
    const userId = req.user.userId;

    let googleSheetId = null;

    // Create Google Sheet for item tracking
    try {
      const sheet = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `Marketplace Item: ${title}`,
          },
          sheets: [
            {
              properties: {
                title: 'Item Info',
                gridProperties: {
                  rowCount: 10,
                  columnCount: 5,
                },
              },
            },
            {
              properties: {
                title: 'Transactions',
                gridProperties: {
                  rowCount: 100,
                  columnCount: 8,
                },
              },
            },
            {
              properties: {
                title: 'Analytics',
                gridProperties: {
                  rowCount: 20,
                  columnCount: 5,
                },
              },
            },
          ],
        },
      });

      googleSheetId = sheet.data.spreadsheetId;

      // Set up headers for item info sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId: googleSheetId,
        range: 'Item Info!A1:E1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [
            ['Title', 'Description', 'Category', 'Price', 'Condition']
          ]
        }
      });

      // Set up headers for transactions sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId: googleSheetId,
        range: 'Transactions!A1:H1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [
            ['Transaction ID', 'Buyer ID', 'Seller ID', 'Amount', 'Status', 'Created At', 'Completed At', 'Notes']
          ]
        }
      });

      // Add item info to sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId: googleSheetId,
        range: 'Item Info!A2:E2',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[title, description, category, price, condition]]
        }
      });

    } catch (googleError) {
      console.error('Google Sheets creation error:', googleError);
      // Continue without Google integration if it fails
    }

    const newItem = {
      id: marketplaceItems.length + 1,
      userId,
      title,
      description,
      category,
      price: parseFloat(price),
      condition,
      images: [],
      googleDriveIds: [],
      googleSheetId,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    marketplaceItems.push(newItem);

    res.status(201).json({
      message: 'Marketplace item created successfully',
      item: newItem
    });
  } catch (error) {
    console.error('Create marketplace item error:', error);
    res.status(500).json({ error: 'Failed to create marketplace item' });
  }
});

// Upload images for marketplace item
router.post('/:id/images', upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Verify item exists and belongs to user
    const item = marketplaceItems.find(item => item.id === parseInt(id) && item.userId === userId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    const uploadedImages = [];
    const googleDriveIds = [];

    for (const file of req.files) {
      try {
        // Upload to Google Drive
        const fileMetadata = {
          name: `${item.title}_${Date.now()}_${file.originalname}`,
          parents: [] // You can specify folder ID here
        };

        const media = {
          mimeType: file.mimetype,
          body: file.buffer
        };

        const uploadedFile = await drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: 'id, name, webViewLink, thumbnailLink'
        });

        const imageData = {
          id: uploadedFile.data.id,
          name: uploadedFile.data.name,
          webViewLink: uploadedFile.data.webViewLink,
          thumbnailLink: uploadedFile.data.thumbnailLink,
          mimeType: file.mimetype
        };

        uploadedImages.push(imageData);
        googleDriveIds.push(uploadedFile.data.id);

      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
      }
    }

    // Update item with new images
    const itemIndex = marketplaceItems.findIndex(item => item.id === parseInt(id));
    if (itemIndex !== -1) {
      marketplaceItems[itemIndex].images = [...marketplaceItems[itemIndex].images, ...uploadedImages];
      marketplaceItems[itemIndex].googleDriveIds = [...marketplaceItems[itemIndex].googleDriveIds, ...googleDriveIds];
      marketplaceItems[itemIndex].updatedAt = new Date();
    }

    res.json({
      message: 'Images uploaded successfully',
      uploadedImages,
      totalImages: marketplaceItems[itemIndex].images.length
    });
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// Update a marketplace item
router.put('/:id', validateItem, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, category, price, condition } = req.body;
    const userId = req.user.userId;

    const itemIndex = marketplaceItems.findIndex(item => item.id === parseInt(id) && item.userId === userId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Update Google Sheet if available
    if (marketplaceItems[itemIndex].googleSheetId) {
      try {
        await sheets.spreadsheets.values.update({
          spreadsheetId: marketplaceItems[itemIndex].googleSheetId,
          range: 'Item Info!A2:E2',
          valueInputOption: 'RAW',
          requestBody: {
            values: [[title, description, category, price, condition]]
          }
        });
      } catch (googleError) {
        console.error('Google Sheets update error:', googleError);
      }
    }

    // Update local item
    marketplaceItems[itemIndex] = {
      ...marketplaceItems[itemIndex],
      title,
      description,
      category,
      price: parseFloat(price),
      condition,
      updatedAt: new Date()
    };

    res.json({
      message: 'Marketplace item updated successfully',
      item: marketplaceItems[itemIndex]
    });
  } catch (error) {
    console.error('Update marketplace item error:', error);
    res.status(500).json({ error: 'Failed to update marketplace item' });
  }
});

// Delete a marketplace item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const itemIndex = marketplaceItems.findIndex(item => item.id === parseInt(id) && item.userId === userId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Delete images from Google Drive
    if (marketplaceItems[itemIndex].googleDriveIds.length > 0) {
      try {
        for (const driveId of marketplaceItems[itemIndex].googleDriveIds) {
          await drive.files.delete({
            fileId: driveId
          });
        }
      } catch (googleError) {
        console.error('Google Drive delete error:', googleError);
      }
    }

    // Remove from local array
    marketplaceItems.splice(itemIndex, 1);

    res.json({ message: 'Marketplace item deleted successfully' });
  } catch (error) {
    console.error('Delete marketplace item error:', error);
    res.status(500).json({ error: 'Failed to delete marketplace item' });
  }
});

// Purchase an item
router.post('/:id/purchase', async (req, res) => {
  try {
    const { id } = req.params;
    const buyerId = req.user.userId;

    const item = marketplaceItems.find(item => item.id === parseInt(id));
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (!item.isAvailable) {
      return res.status(400).json({ error: 'Item is not available for purchase' });
    }

    if (item.userId === buyerId) {
      return res.status(400).json({ error: 'You cannot purchase your own item' });
    }

    // Create transaction
    const transaction = {
      id: transactions.length + 1,
      itemId: parseInt(id),
      buyerId,
      sellerId: item.userId,
      amount: item.price,
      status: 'pending',
      createdAt: new Date()
    };

    transactions.push(transaction);

    // Update item availability
    const itemIndex = marketplaceItems.findIndex(item => item.id === parseInt(id));
    if (itemIndex !== -1) {
      marketplaceItems[itemIndex].isAvailable = false;
      marketplaceItems[itemIndex].updatedAt = new Date();
    }

    // Update Google Sheet if available
    if (item.googleSheetId) {
      try {
        const rowData = [
          transaction.id,
          transaction.buyerId,
          transaction.sellerId,
          transaction.amount,
          transaction.status,
          transaction.createdAt.toISOString(),
          '',
          'Purchase initiated'
        ];

        await sheets.spreadsheets.values.append({
          spreadsheetId: item.googleSheetId,
          range: 'Transactions!A:H',
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
      message: 'Purchase initiated successfully',
      transaction,
      item: marketplaceItems[itemIndex]
    });
  } catch (error) {
    console.error('Purchase item error:', error);
    res.status(500).json({ error: 'Failed to purchase item' });
  }
});

// Complete a transaction
router.patch('/transactions/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const transactionIndex = transactions.findIndex(t => t.id === parseInt(id));
    if (transactionIndex === -1) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const transaction = transactions[transactionIndex];
    
    // Verify user is seller
    if (transaction.sellerId !== userId) {
      return res.status(403).json({ error: 'Only the seller can complete the transaction' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ error: 'Transaction is not pending' });
    }

    // Complete transaction
    transactions[transactionIndex].status = 'completed';
    transactions[transactionIndex].completedAt = new Date();

    // Update Google Sheet if available
    const item = marketplaceItems.find(item => item.id === transaction.itemId);
    if (item && item.googleSheetId) {
      try {
        // Find the transaction row and update status
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: item.googleSheetId,
          range: 'Transactions!A:H'
        });

        const rows = response.data.values;
        for (let i = 1; i < rows.length; i++) {
          if (parseInt(rows[i][0]) === parseInt(id)) {
            await sheets.spreadsheets.values.update({
              spreadsheetId: item.googleSheetId,
              range: `Transactions!E${i + 1}:H${i + 1}`,
              valueInputOption: 'RAW',
              requestBody: {
                values: [['completed', new Date().toISOString(), '', 'Transaction completed']]
              }
            });
            break;
          }
        }
      } catch (googleError) {
        console.error('Google Sheets update error:', googleError);
      }
    }

    res.json({
      message: 'Transaction completed successfully',
      transaction: transactions[transactionIndex]
    });
  } catch (error) {
    console.error('Complete transaction error:', error);
    res.status(500).json({ error: 'Failed to complete transaction' });
  }
});

// Get user's marketplace items
router.get('/user/items', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const userItems = marketplaceItems.filter(item => item.userId === userId);
    
    res.json({
      items: userItems,
      total: userItems.length
    });
  } catch (error) {
    console.error('Get user items error:', error);
    res.status(500).json({ error: 'Failed to fetch user items' });
  }
});

// Get user's transactions
router.get('/user/transactions', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const userTransactions = transactions.filter(t => 
      t.buyerId === userId || t.sellerId === userId
    );
    
    res.json({
      transactions: userTransactions,
      total: userTransactions.length
    });
  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch user transactions' });
  }
});

export default router;
