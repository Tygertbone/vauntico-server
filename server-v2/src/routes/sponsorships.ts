import express from 'express';
import { sponsorshipService } from '../services/sponsorshipService';
import { apiAuthMiddleware } from '../middleware/auth';
import logger from '../utils/logger';

const router = express.Router();

// Get sponsorships with optional filters
router.get('/', apiAuthMiddleware, async (req, res) => {
  try {
    const { sponsorId, creatorId, status, tier, limit = 50, offset = 0 } = req.query;
    
    const filters: any = {};
    if (sponsorId) filters.sponsorId = sponsorId;
    if (creatorId) filters.creatorId = creatorId;
    if (status) filters.status = status;
    if (tier) filters.tier = tier;
    if (limit) filters.limit = parseInt(limit as string);
    if (offset) filters.offset = parseInt(offset as string);

    const result = await sponsorshipService.getSponsorships(filters);
    
    res.json({
      success: true,
      data: result.sponsorships,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: result.total
      }
    });
  } catch (error) {
    logger.error('Error fetching sponsorships:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sponsorships'
    });
  }
});

// Create a new sponsorship
router.post('/', apiAuthMiddleware, async (req, res) => {
  try {
    const sponsorshipData = {
      ...req.body,
      startDate: req.body.startDate ? new Date(req.body.startDate) : new Date()
    };

    // Validate required fields
    const requiredFields = ['creatorId', 'tier', 'amount'];
    for (const field of requiredFields) {
      if (!sponsorshipData[field]) {
        return res.status(400).json({
          success: false,
          error: `${field} is required`
        });
      }
    }

    const sponsorship = await sponsorshipService.createSponsorship(sponsorshipData);
    res.status(201).json({
      success: true,
      data: sponsorship,
      message: 'Sponsorship created successfully'
    });
  } catch (error) {
    logger.error('Error creating sponsorship:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create sponsorship'
    });
  }
});

// Update sponsorship KPIs
router.put('/:id/kpis', apiAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const kpis = req.body;

    const sponsorship = await sponsorshipService.updateSponsorshipKPIs(id, kpis);
    res.json({
      success: true,
      data: sponsorship,
      message: 'Sponsorship KPIs updated successfully'
    });
  } catch (error) {
    logger.error('Error updating sponsorship KPIs:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update sponsorship KPIs'
    });
  }
});

// Get sponsorship analytics
router.get('/:id/analytics', apiAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { timeframe = '30d' } = req.query;

    const analytics = await sponsorshipService.getSponsorshipAnalytics(id, timeframe as any);
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Error fetching sponsorship analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sponsorship analytics'
    });
  }
});

// Calculate ROI for a sponsorship
router.get('/:id/roi', apiAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const roi = await sponsorshipService.calculateROI(id);
    res.json({
      success: true,
      data: { sponsorshipId: id, roi },
      message: 'ROI calculated successfully'
    });
  } catch (error) {
    logger.error('Error calculating ROI:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate ROI'
    });
  }
});

// Get available sponsorship tiers
router.get('/tiers', apiAuthMiddleware, async (req, res) => {
  try {
    const tiers = await sponsorshipService.getSponsorshipTiers();
    res.json({
      success: true,
      data: tiers
    });
  } catch (error) {
    logger.error('Error fetching sponsorship tiers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sponsorship tiers'
    });
  }
});

// Get sponsorships for current user (as sponsor)
router.get('/my-sponsorships', apiAuthMiddleware, async (req, res) => {
  try {
    const { status, tier, limit = 50, offset = 0 } = req.query;
    
    const filters: any = {
      sponsorId: req.user?.userId,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    };
    
    if (status) filters.status = status;
    if (tier) filters.tier = tier;

    const result = await sponsorshipService.getSponsorships(filters);
    
    res.json({
      success: true,
      data: result.sponsorships,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: result.total
      }
    });
  } catch (error) {
    logger.error('Error fetching user sponsorships:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user sponsorships'
    });
  }
});

// Get sponsorships for current user (as creator)
router.get('/my-creator-sponsorships', apiAuthMiddleware, async (req, res) => {
  try {
    const { status, tier, limit = 50, offset = 0 } = req.query;
    
    const filters: any = {
      creatorId: req.user?.userId,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    };
    
    if (status) filters.status = status;
    if (tier) filters.tier = tier;

    const result = await sponsorshipService.getSponsorships(filters);
    
    res.json({
      success: true,
      data: result.sponsorships,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: result.total
      }
    });
  } catch (error) {
    logger.error('Error fetching creator sponsorships:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch creator sponsorships'
    });
  }
});

export default router;