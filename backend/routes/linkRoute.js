const express = require('express');
const router = express.Router();
const urlController = require('../controller/mainController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:shortCode', urlController.redirect);

router.post(
  '/api/shorten',
  authMiddleware.requirePermission('admin'),
  urlController.shortenUrl,
);

router.post(
  '/api/shorten/advanced',
  authMiddleware.requirePermission('admin'),
  urlController.shortenUrlAdvanced,
);

router.get(
  '/api/urls',
  authMiddleware.requirePermission('admin'),
  urlController.getUserUrls,
);

router.get(
  '/api/urls/:shortCode',
  authMiddleware.requirePermission('admin'),
  urlController.getUrlDetails,
);

router.delete(
  '/api/urls/:shortCode',
  authMiddleware.requirePermission('admin'),
  urlController.deleteUrl,
);

router.get(
  '/api/stats',
  authMiddleware.requirePermission('admin'),
  urlController.getUserStats,
);

module.exports = router;
