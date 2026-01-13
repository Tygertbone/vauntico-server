import { Router, type Router as ExpressRouter } from 'express';
import { marketplaceService } from '../services/marketplaceService';
import { apiAuthMiddleware } from '../middleware/auth';
import logger from '../utils/logger';

const router: ExpressRouter = Router();

// Get marketplace items with filters
router.get('/items', apiAuthMiddleware, async (req, res) => {
  try {
    const { creatorId, type, status, tags, minPrice, maxPrice, limit = 50, offset = 0 } = req.query;
    
    const filters: any = {};
    if (creatorId) filters.creatorId = creatorId;
    if (type) filters.type = type;
    if (status) filters.status = status;
    if (tags) filters.tags = Array.isArray(tags) ? tags : [tags];
    if (minPrice) filters.minPrice = parseFloat(minPrice as string);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
    if (limit) filters.limit = parseInt(limit as string);
    if (offset) filters.offset = parseInt(offset as string);

    const result = await marketplaceService.getMarketplaceItems(filters);
    
    res.json({
      success: true,
      data: result.items,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: result.total
      }
    });
  } catch (error) {
    logger.error('Error fetching marketplace items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch marketplace items'
    });
  }
});

// Create a new marketplace item
router.post('/items', apiAuthMiddleware, async (req, res) => {
  try {
    const itemData = {
      ...req.body,
      creatorId: req.user?.userId
    };

    // Validate required fields
    const requiredFields = ['title', 'description', 'type', 'price'];
    for (const field of requiredFields) {
      if (!itemData[field]) {
        return res.status(400).json({
          success: false,
          error: `${field} is required`
        });
      }
    }

    const item = await marketplaceService.createMarketplaceItem(itemData);
    res.status(201).json({
      success: true,
      data: item,
      message: 'Marketplace item created successfully and submitted for compliance review'
    });
  } catch (error) {
    logger.error('Error creating marketplace item:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create marketplace item'
    });
  }
});

// Update a marketplace item
router.put('/items/:id', apiAuthMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    // Check if user is creator of this item
    const items = await marketplaceService.getMarketplaceItems({ creatorId: req.user?.userId });
    const userItem = items.items.find(item => item.id === id);
    
    if (!userItem) {
      return res.status(403).json({
        success: false,
        error: 'You can only update your own items'
      });
    }

    const item = await marketplaceService.updateMarketplaceItem(id, updates);
    res.json({
      success: true,
      data: item,
      message: 'Marketplace item updated successfully'
    });
  } catch (error) {
    logger.error('Error updating marketplace item:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update marketplace item'
    });
  }
});

// Purchase a marketplace item
router.post('/items/:id/purchase', apiAuthMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const buyerId = req.user?.userId;

    const purchase = await marketplaceService.purchaseItem(id, buyerId);
    res.status(201).json({
      success: true,
      data: purchase,
      message: 'Item purchased successfully'
    });
  } catch (error) {
    logger.error('Error purchasing item:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to purchase item'
    });
  }
});

// Get user's purchases
router.get('/purchases', apiAuthMiddleware, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const items = await marketplaceService.getMarketplaceItems({
      creatorId: req.user?.userId,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    // Get user's purchases (this would need a separate method in real implementation)
    const purchases = []; // Mock - would fetch actual purchases
    
    res.json({
      success: true,
      data: purchases,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: purchases.length
      }
    });
  } catch (error) {
    logger.error('Error fetching user purchases:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user purchases'
    });
  }
});

// Get compliance checks for an item
router.get('/items/:id/compliance', apiAuthMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.query;

    const checks = await marketplaceService.getComplianceChecks(id, status as any);
    res.json({
      success: true,
      data: checks,
      count: checks.length
    });
  } catch (error) {
    logger.error('Error fetching compliance checks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch compliance checks'
    });
  }
});

// Update compliance check
router.put('/compliance/:id', apiAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const check = await marketplaceService.updateComplianceCheck(id, updates);
    res.json({
      success: true,
      data: check,
      message: 'Compliance check updated successfully'
    });
  } catch (error) {
    logger.error('Error updating compliance check:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update compliance check'
    });
  }
});

// Get marketplace statistics
router.get('/stats', apiAuthMiddleware, async (req, res) => {
  try {
    const stats = await marketplaceService.getMarketplaceStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error fetching marketplace stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch marketplace stats'
    });
  }
});

// Get user's marketplace items
router.get('/my-items', apiAuthMiddleware, async (req, res) => {
  try {
    const { type, status, tags, minPrice, maxPrice, limit = 50, offset = 0 } = req.query;
    
    const filters: any = {
      creatorId: req.user?.userId,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    };
    
    if (type) filters.type = type;
    if (status) filters.status = status;
    if (tags) filters.tags = Array.isArray(tags) ? tags : [tags];
    if (minPrice) filters.minPrice = parseFloat(minPrice as string);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);

    const result = await marketplaceService.getMarketplaceItems(filters);
    
    res.json({
      success: true,
      data: result.items,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: result.total
      }
    });
  } catch (error) {
    logger.error('Error fetching user marketplace items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user marketplace items'
    });
  }
});

export default router;
