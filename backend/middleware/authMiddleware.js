const axios = require('axios');

class AuthMiddleware {
  constructor(
    jwtValidationUrl = process.env.JWT_VALIDATION_URL,
    apiKeyValidationUrl = process.env.API_KEY_VALIDATION_URL,
  ) {
    this.jwtValidationUrl = jwtValidationUrl;
    this.apiKeyValidationUrl = apiKeyValidationUrl;
  }

  /**
   * Validate JWT via HTTP call
   * @param {string} token - The JWT token to validate
   * @returns {Promise<{valid: boolean, data?: any, message?: string}>}
   */
  async validateJWT(token) {
    let response;
    try {
      const response = await axios.post(
        this.jwtValidationUrl,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-api-key': process.env.AUTH_MICROSERVICE_API_KEY,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        },
      );
      return {
        valid: response.data.success || false,
        data: response.data.data || null,
        message: response.data.message,
      };
    } catch (error) {
      console.error('❌ JWT validation error:', error.message);

      if (error.response) {
        return {
          valid: false,
          message: error.response.data?.message || 'JWT validation failed',
        };
      }

      return {
        valid: false,
        message: 'Unable to validate JWT token',
      };
    }
  }

  /**
   * Validate API key via HTTP call
   * @param {string} apiKey - The API key to validate
   * @returns {Promise<{valid: boolean, data?: any, message?: string}>}
   */
  async validateApiKey(apiKey, token) {
    try {
      const response = await axios.post(
        this.apiKeyValidationUrl,
        {
          apiKey,
          serviceId: 'url-service',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'x-api-key': process.env.AUTH_MICROSERVICE_API_KEY,
          },
          timeout: 5000,
        },
      );
      return {
        valid: response.data.success || false,
        data: response.data.data || null,
        message: response.data.message,
      };
    } catch (error) {
      console.error('❌ API key validation error:', error.message);

      if (error.response) {
        return {
          valid: false,
          message: error.response.data?.message || 'API key validation failed',
        };
      }

      return {
        valid: false,
        message: 'Unable to validate API key',
      };
    }
  }

  /**
   * Unified authentication and authorization middleware
   * Validates BOTH JWT token (mandatory) AND API key (mandatory)
   * Checks API key scopes against required permissions
   *
   * @param {...string} requiredPermissions - Required API key scopes (e.g., "admin")
   */
  requirePermission = (...requiredPermissions) => {
    return async (req, res, next) => {
      try {
        // ============= EXTRACT JWT TOKEN (MANDATORY) =============
        const token =
          req.header('Authorization')?.replace('Bearer ', '') ||
          req.headers.authorization?.replace('Bearer ', '') ||
          req.cookies?.token;

        if (!token) {
          return res.status(401).json({
            success: false,
            error: 'Access denied. JWT token is required.',
          });
        }

        // ============= EXTRACT API KEY (MANDATORY) =============
        const apiKey = req.headers['x-api-key'];

        if (!apiKey) {
          return res.status(401).json({
            success: false,
            message: 'API key is required in x-api-key header',
          });
        }

        // ============= VALIDATE BOTH IN PARALLEL =============
        const [jwtResult, apiKeyResult] = await Promise.all([
          this.validateJWT(token),
          this.validateApiKey(apiKey, token),
        ]);

        // ============= CHECK JWT VALIDATION =============
        if (!jwtResult.valid || !jwtResult.data) {
          return res.status(401).json({
            success: false,
            error: jwtResult.message || 'Invalid or expired JWT token',
          });
        }

        // ============= CHECK API KEY VALIDATION =============
        if (!apiKeyResult.valid || !apiKeyResult.data) {
          return res.status(401).json({
            success: false,
            message: apiKeyResult.message || 'Invalid API key',
          });
        }

        // ============= ATTACH TO REQUEST =============
        req.user = jwtResult.data;
        req.apiKey = apiKeyResult.data;

        // ============= API KEY PERMISSION CHECK =============
        const scopes = Array.isArray(req.apiKey.scopes)
          ? req.apiKey.scopes
          : [];

        // Always allow admin (super-scope)
        const hasPermission =
          scopes.includes('admin') ||
          requiredPermissions.some((perm) => scopes.includes(perm));

        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            message: `Insufficient permissions. Required any of: ${requiredPermissions.join(', ')}`,
          });
        }

        next();
      } catch (error) {
        console.error('❌ [requirePermission] error:', error);

        return res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    };
  };
}

// Create singleton instance
const authMiddleware = new AuthMiddleware();

// Export instance
module.exports = authMiddleware;
