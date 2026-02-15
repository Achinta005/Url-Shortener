const Url = require('../models/urlSchema');
const crypto = require('crypto');

class UrlController {
  generateRandomShortCode(length = 6) {
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomBytes = crypto.randomBytes(length);
    let code = '';

    for (let i = 0; i < length; i++) {
      code += chars[randomBytes[i] % chars.length];
    }

    return code;
  }

  async generateUniqueShortCode(length = 6, maxAttempts = 5) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const code = this.generateRandomShortCode(length);

      const exists = await Url.findOne({ shortCode: code });

      if (!exists) {
        return code;
      }
    }

    if (length < 10) {
      return await this.generateUniqueShortCode(length + 1, maxAttempts);
    }

    throw new Error(
      'Unable to generate unique short code after multiple attempts',
    );
  }

  shortenUrl = async (req, res) => {
    try {
      const { originalUrl } = req.body;

      const userId = req.user?.id || req.user?._id || req.user?.userId;

      if (!originalUrl) {
        return res.status(400).json({
          success: false,
          error: 'Original URL is required',
        });
      }

      try {
        const url = new URL(originalUrl);
        if (!['http:', 'https:'].includes(url.protocol)) {
          return res.status(400).json({
            success: false,
            error: 'Only HTTP and HTTPS URLs are allowed',
          });
        }
      } catch (err) {
        return res.status(400).json({
          success: false,
          error: 'Invalid URL format',
        });
      }

      const existingUrl = await Url.findOne({
        originalUrl,
        userId,
        deletedAt: null,
        isActive: true,
      });

      if (existingUrl) {
        return res.status(200).json({
          success: true,
          message: 'URL already shortened',
          data: {
            shortCode: existingUrl.shortCode,
            shortUrl: existingUrl.shortUrl,
            originalUrl: existingUrl.originalUrl,
            createdAt: existingUrl.createdAt,
            totalClicks: existingUrl.totalClicks,
          },
        });
      }

      const shortCode = await this.generateUniqueShortCode();

      const urlDoc = new Url({
        shortCode,
        originalUrl,
        userId,
        customCode: false,
        isActive: true,
      });

      await urlDoc.save();

      return res.status(201).json({
        success: true,
        message: 'URL shortened successfully',
        data: {
          shortCode: urlDoc.shortCode,
          shortUrl: urlDoc.shortUrl,
          originalUrl: urlDoc.originalUrl,
          createdAt: urlDoc.createdAt,
          expiresAt: urlDoc.expiresAt,
          totalClicks: urlDoc.totalClicks,
        },
      });
    } catch (error) {
      console.error('Error in shortenUrl:', error);

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          error: 'Short code collision occurred. Please try again.',
        });
      }

      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Internal server error while creating short URL',
      });
    }
  };

  shortenUrlAdvanced = async (req, res) => {
    try {
      const {
        originalUrl,
        customCode,
        expiresAt,
        maxClicks,
        title,
        description,
        tags,
        utm,
        redirectType,
      } = req.body;

      const userId = req.user?.id || req.user?._id || req.user?.userId;

      if (!originalUrl) {
        return res.status(400).json({
          success: false,
          error: 'Original URL is required',
        });
      }

      try {
        const url = new URL(originalUrl);
        if (!['http:', 'https:'].includes(url.protocol)) {
          return res.status(400).json({
            success: false,
            error: 'Only HTTP and HTTPS URLs are allowed',
          });
        }
      } catch (err) {
        return res.status(400).json({
          success: false,
          error: 'Invalid URL format',
        });
      }

      let shortCode;
      if (customCode) {
        if (!/^[a-zA-Z0-9_-]{6,10}$/.test(customCode)) {
          return res.status(400).json({
            success: false,
            error: 'Custom code must be 6-10 alphanumeric characters',
          });
        }

        const exists = await Url.findOne({ shortCode: customCode });
        if (exists) {
          return res.status(409).json({
            success: false,
            error: 'Custom code already taken',
          });
        }

        shortCode = customCode;
      } else {
        shortCode = await this.generateUniqueShortCode();
      }

      if (expiresAt) {
        const expDate = new Date(expiresAt);
        if (expDate <= new Date()) {
          return res.status(400).json({
            success: false,
            error: 'Expiration date must be in the future',
          });
        }
      }

      const urlDoc = new Url({
        shortCode,
        originalUrl,
        userId,
        customCode: !!customCode,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxClicks: maxClicks || null,
        title: title || null,
        description: description || null,
        tags: tags || [],
        utm: utm || {},
        redirectType: redirectType || 302,
        isActive: true,
      });

      await urlDoc.save();

      return res.status(201).json({
        success: true,
        message: 'URL shortened successfully',
        data: {
          shortCode: urlDoc.shortCode,
          shortUrl: urlDoc.shortUrl,
          originalUrl: urlDoc.originalUrl,
          title: urlDoc.title,
          description: urlDoc.description,
          tags: urlDoc.tags,
          expiresAt: urlDoc.expiresAt,
          maxClicks: urlDoc.maxClicks,
          createdAt: urlDoc.createdAt,
          totalClicks: urlDoc.totalClicks,
        },
      });
    } catch (error) {
      console.error('Error in shortenUrlAdvanced:', error);

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          error: 'Short code collision occurred. Please try again.',
        });
      }

      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Internal server error while creating short URL',
      });
    }
  };

  redirect = async (req, res) => {
    try {
      const { shortCode } = req.params;

      const url = await Url.findActiveByShortCode(shortCode);

      if (!url) {
        return res.status(404).json({
          success: false,
          error: 'URL not found or has expired',
        });
      }

      if (!url.isAccessible()) {
        return res.status(410).json({
          success: false,
          error: 'URL is no longer available',
        });
      }

      const countryCode =
        req.headers['cf-ipcountry'] || req.headers['x-country-code'];
      const referrer = req.headers.referer || req.headers.referrer;

      if (countryCode && !url.isAllowedInCountry(countryCode)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied from your location',
        });
      }

      if (!url.isAllowedReferrer(referrer)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied from this referrer',
        });
      }

      url.incrementClicks().catch((err) => {
        console.error('Error incrementing clicks:', err);
      });

      const redirectUrl = url.getFullUrl();

      return res.redirect(url.redirectType, redirectUrl);
    } catch (error) {
      console.error('Error in redirect:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };

  getUrlDetails = async (req, res) => {
    try {
      const { shortCode } = req.params;
      const userId = req.user?.id || req.user?._id || req.user?.userId;

      const url = await Url.findOne({
        shortCode,
        userId,
        deletedAt: null,
      });

      if (!url) {
        return res.status(404).json({
          success: false,
          error: 'URL not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: url,
      });
    } catch (error) {
      console.error('Error in getUrlDetails:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };

  getUserUrls = async (req, res) => {
    try {
      const userId = req.user?.id || req.user?._id || req.user?.userId;
      const {
        page = 1,
        limit = 10,
        sort = 'createdAt',
        order = 'desc',
      } = req.query;

      const sortObj = { [sort]: order === 'desc' ? -1 : 1 };

      const result = await Url.findByUser(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: sortObj,
      });

      return res.status(200).json({
        success: true,
        data: result.urls,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('Error in getUserUrls:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };

  deleteUrl = async (req, res) => {
    try {
      const { shortCode } = req.params;
      const userId = req.user?.id || req.user?._id || req.user?.userId;

      const deletedUrl = await Url.findOneAndDelete({
        shortCode,
        userId,
        deletedAt: null,
      });

      if (!deletedUrl) {
        return res.status(404).json({
          success: false,
          error: 'URL not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'URL permanently deleted',
        data: {
          shortCode: deletedUrl.shortCode,
          originalUrl: deletedUrl.originalUrl,
        },
      });
    } catch (error) {
      console.error('Error in deleteUrl:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };

  getUserStats = async (req, res) => {
    try {
      const userId = req.user?.id || req.user?._id || req.user?.userId;

      const stats = await Url.getUserStats(userId);

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error in getUserStats:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };
}

module.exports = new UrlController();
