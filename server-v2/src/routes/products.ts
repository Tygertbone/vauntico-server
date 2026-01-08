import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { apiRateLimit } from '../middleware/rateLimit';
import { logger } from '../utils/logger';
import { pool } from '../db/pool';

const router = Router();

// Product validation middleware
const validateProductData = (req: Request, res: Response, next: Function) => {
  const { title, description, price, category } = req.body;

  if (!title || title.length < 5 || title.length > 200) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Title must be between 5 and 200 characters',
    });
  }

  if (price !== undefined && (isNaN(price) || price < 0)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Price must be a positive number',
    });
  }

  next();
};

// Trusted creators can access marketplace features
const requireTrustedCreator = async (req: Request, res: Response, next: Function) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Check trust score
    const trustScoreQuery = `
      SELECT overall_score
      FROM trust_scores
      WHERE user_id = $1
      ORDER BY calculated_at DESC
      LIMIT 1
    `;
    const trustScoreResult = await pool.query(trustScoreQuery, [req.user.userId]);

    if (trustScoreResult.rows.length === 0 || trustScoreResult.rows[0].overall_score < 60) {
      return res.status(403).json({
        error: 'Insufficient Trust Score',
        message: 'You need at least 60 trust score to participate in the marketplace',
      });
    }

    next();
  } catch (error) {
    logger.error('Trust score check failed', { error, userId: req.user?.userId });
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to validate trust score',
    });
  }
};

// Apply authentication to all routes
router.use(authenticate);

// GET /api/products - List products with filtering and pagination
router.get('/', apiRateLimit, async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      min_price,
      max_price,
      min_trust_score = 60,
      sort_by = 'created_at',
      sort_order = 'desc',
      creator_id,
      tags,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    let whereConditions = ['p.is_active = true', 'p.moderation_status = \'approved\''];
    let params: any[] = [];
    let paramIndex = 1;

    // Build WHERE conditions
    if (search) {
      whereConditions.push(`(p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      whereConditions.push(`p.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (min_price) {
      whereConditions.push(`p.price >= $${paramIndex}`);
      params.push(Number(min_price));
      paramIndex++;
    }

    if (max_price) {
      whereConditions.push(`p.price <= $${paramIndex}`);
      params.push(Number(max_price));
      paramIndex++;
    }

    if (min_trust_score) {
      whereConditions.push(`
        COALESCE(s.trust_score, ts.overall_score, 0) >= $${paramIndex}
      `);
      params.push(Number(min_trust_score));
      paramIndex++;
    }

    if (creator_id) {
      whereConditions.push(`p.creator_id = $${paramIndex}`);
      params.push(creator_id);
      paramIndex++;
    }

    if (tags) {
      whereConditions.push(`p.tags && $${paramIndex}`);
      params.push(Array.isArray(tags) ? tags : [tags]);
      paramIndex++;
    }

    // Validate sort parameters
    const allowedSortFields = ['created_at', 'price', 'title'];
    const allowedSortOrders = ['asc', 'desc'];
    const sortField = allowedSortFields.includes(sort_by as string) ? sort_by : 'created_at';
    const sortDir = allowedSortOrders.includes(sort_order as string) ? sort_order : 'desc';

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN storefronts s ON s.creator_id = p.creator_id
      LEFT JOIN trust_scores ts ON ts.user_id = p.creator_id AND ts.calculated_at >= NOW() - INTERVAL '24 hours'
      WHERE ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params);
    const total = Number(countResult.rows[0].total);

    // Get products with creator storefront info and average ratings
    const query = `
      SELECT
        p.*,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        u.email as creator_email,
        s.bio as creator_bio,
        s.profile_image_url,
        s.banner_image_url,
        s.social_links as creator_social_links,
        s.total_sales as creator_total_sales,
        s.total_revenue as creator_total_revenue,
        COALESCE(s.trust_score, ts.overall_score, 0) as creator_trust_score,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count
      FROM products p
      JOIN users u ON u.id = p.creator_id
      LEFT JOIN storefronts s ON s.creator_id = p.creator_id
      LEFT JOIN trust_scores ts ON ts.user_id = p.creator_id AND ts.calculated_at >= NOW() - INTERVAL '24 hours'
      LEFT JOIN reviews r ON r.product_id = p.id AND r.moderation_status = 'approved'
      WHERE ${whereClause}
      GROUP BY p.id, u.id, s.id, ts.overall_score
      ORDER BY p.${sortField} ${sortDir}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(Number(limit), offset);
    const result = await pool.query(query, params);

    // Format response
    const products = result.rows.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: parseFloat(product.price),
      trust_score_required: parseFloat(product.trust_score_required),
      category: product.category,
      tags: product.tags || [],
      images: product.images || [],
      media_urls: product.media_urls || [],
      is_active: product.is_active,
      moderation_status: product.moderation_status,
      created_at: product.created_at,
      updated_at: product.updated_at,
      creator: {
        id: product.creator_id,
        name: `${product.creator_first_name} ${product.creator_last_name}`.trim(),
        email: product.creator_email,
        bio: product.creator_bio,
        profile_image_url: product.profile_image_url,
        banner_image_url: product.banner_image_url,
        social_links: product.creator_social_links,
        total_sales: product.creator_total_sales,
        total_revenue: parseFloat(product.creator_total_revenue),
        trust_score: parseFloat(product.creator_trust_score),
      },
      stats: {
        average_rating: parseFloat(product.average_rating),
        review_count: Number(product.review_count),
      },
    }));

    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        total_pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Get products failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.userId,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get products',
    });
  }
});

// POST /api/products - Create new product (trusted creators only)
router.post('/',
  requireTrustedCreator,
  apiRateLimit,
  validateProductData,
  async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      price,
      trust_score_required = 60,
      category,
      tags = [],
      images = [],
      media_urls = [],
    } = req.body;

    const creator_id = req.user!.userId;

    // Insert product
    const insertQuery = `
      INSERT INTO products (
        creator_id, title, description, price, trust_score_required,
        category, tags, images, media_urls, moderation_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
      RETURNING *
    `;

    const values = [
      creator_id,
      title,
      description,
      price,
      trust_score_required,
      category,
      tags,
      images,
      media_urls,
    ];

    const result = await pool.query(insertQuery, values);
    const product = result.rows[0];

    logger.info('Product created', { productId: product.id, creatorId: creator_id });

    res.status(201).json({
      product: {
        ...product,
        price: parseFloat(product.price),
        trust_score_required: parseFloat(product.trust_score_required),
      },
      message: 'Product created successfully. It will be reviewed before going live.',
    });
  } catch (error) {
    logger.error('Create product failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.userId,
    });

    if (error instanceof Error && error.message.includes('duplicate key')) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A product with this title already exists',
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create product',
    });
  }
});

// GET /api/products/:id - Get product details
router.get('/:id', apiRateLimit, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        p.*,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        u.email as creator_email,
        s.bio as creator_bio,
        s.profile_image_url,
        s.banner_image_url,
        s.social_links as creator_social_links,
        s.total_sales as creator_total_sales,
        s.total_revenue as creator_total_revenue,
        COALESCE(s.trust_score, ts.overall_score, 0) as creator_trust_score,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count
      FROM products p
      JOIN users u ON u.id = p.creator_id
      LEFT JOIN storefronts s ON s.creator_id = p.creator_id
      LEFT JOIN trust_scores ts ON ts.user_id = p.creator_id AND ts.calculated_at >= NOW() - INTERVAL '24 hours'
      LEFT JOIN reviews r ON r.product_id = p.id AND r.moderation_status = 'approved'
      WHERE p.id = $1 AND p.is_active = true
      GROUP BY p.id, u.id, s.id, ts.overall_score
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not found',
      });
    }

    const product = result.rows[0];

    // Get recent reviews
    const reviewsQuery = `
      SELECT
        r.*,
        u.first_name as reviewer_first_name,
        u.last_name as reviewer_last_name
      FROM reviews r
      JOIN users u ON u.id = r.reviewer_id
      WHERE r.product_id = $1 AND r.moderation_status = 'approved'
      ORDER BY r.created_at DESC
      LIMIT 10
    `;
    const reviewsResult = await pool.query(reviewsQuery, [id]);

    const reviews = reviewsResult.rows.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      is_verified_purchase: review.is_verified_purchase,
      helpful_count: review.helpful_count,
      created_at: review.created_at,
      reviewer: {
        name: `${review.reviewer_first_name} ${review.reviewer_last_name}`.trim(),
      },
    }));

    res.json({
      product: {
        id: product.id,
        title: product.title,
        description: product.description,
        price: parseFloat(product.price),
        trust_score_required: parseFloat(product.trust_score_required),
        category: product.category,
        tags: product.tags || [],
        images: product.images || [],
        media_urls: product.media_urls || [],
        is_active: product.is_active,
        moderation_status: product.moderation_status,
        created_at: product.created_at,
        updated_at: product.updated_at,
        creator: {
          id: product.creator_id,
          name: `${product.creator_first_name} ${product.creator_last_name}`.trim(),
          email: product.creator_email,
          bio: product.creator_bio,
          profile_image_url: product.profile_image_url,
          banner_image_url: product.banner_image_url,
          social_links: product.creator_social_links,
          total_sales: product.creator_total_sales,
          total_revenue: parseFloat(product.creator_total_revenue),
          trust_score: parseFloat(product.creator_trust_score),
        },
        stats: {
          average_rating: parseFloat(product.average_rating),
          review_count: Number(product.review_count),
        },
      },
      reviews,
    });
  } catch (error) {
    logger.error('Get product details failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.userId,
      productId: req.params.id,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get product details',
    });
  }
});

// PUT /api/products/:id - Update product (creator only)
router.put('/:id',
  validateProductData,
  apiRateLimit,
  async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const creator_id = req.user!.userId;

    const {
      title,
      description,
      price,
      trust_score_required,
      category,
      tags,
      images,
      media_urls,
    } = req.body;

    // Check if product exists and belongs to user
    const checkQuery = 'SELECT * FROM products WHERE id = $1 AND creator_id = $2';
    const checkResult = await pool.query(checkQuery, [id, creator_id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not found or you do not have permission to edit it',
      });
    }

    // Update product
    const updateQuery = `
      UPDATE products
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          price = COALESCE($3, price),
          trust_score_required = COALESCE($4, trust_score_required),
          category = COALESCE($5, category),
          tags = COALESCE($6, tags),
          images = COALESCE($7, images),
          media_urls = COALESCE($8, media_urls),
          updated_at = NOW()
      WHERE id = $9 AND creator_id = $10
      RETURNING *
    `;

    const values = [
      title,
      description,
      price,
      trust_score_required,
      category,
      tags,
      images,
      media_urls,
      id,
      creator_id,
    ];

    const result = await pool.query(updateQuery, values);
    const product = result.rows[0];

    logger.info('Product updated', { productId: id, creatorId: creator_id });

    res.json({
      product: {
        ...product,
        price: parseFloat(product.price),
        trust_score_required: parseFloat(product.trust_score_required),
      },
      message: 'Product updated successfully',
    });
  } catch (error) {
    logger.error('Update product failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.userId,
      productId: req.params.id,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update product',
    });
  }
});

// DELETE /api/products/:id - Delete product (creator only)
router.delete('/:id', apiRateLimit, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const creator_id = req.user!.userId;

    // Check if product exists and belongs to user
    const checkQuery = 'SELECT * FROM products WHERE id = $1 AND creator_id = $2';
    const checkResult = await pool.query(checkQuery, [id, creator_id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not found or you do not have permission to delete it',
      });
    }

    // Soft delete (mark as inactive)
    const deleteQuery = 'UPDATE products SET is_active = false, updated_at = NOW() WHERE id = $1';
    await pool.query(deleteQuery, [id]);

    logger.info('Product deleted (soft delete)', { productId: id, creatorId: creator_id });

    res.json({
      message: 'Product deleted successfully',
    });
  } catch (error) {
    logger.error('Delete product failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.userId,
      productId: req.params.id,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete product',
    });
  }
});

export default router;
