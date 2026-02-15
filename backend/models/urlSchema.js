const mongoose = require('mongoose');
const LinkShortDB = require('../config/db');

const urlSchema = new mongoose.Schema(
  {
    shortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9_-]{6,10}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid short code!`,
      },
    },
    originalUrl: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
      validate: {
        validator: function (v) {
          try {
            const url = new URL(v);
            return ['http:', 'https:'].includes(url.protocol);
          } catch (err) {
            return false;
          }
        },
        message: (props) => `${props.value} is not a valid HTTP/HTTPS URL!`,
      },
    },
    userId: {
      type: String,
      required: false,
      index: true,
      trim: true,
      sparse: true,
    },
    customCode: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    totalClicks: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    lastClickedAt: {
      type: Date,
      default: null,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 50,
    }],
    utm: {
      source: { type: String, trim: true, default: null },
      medium: { type: String, trim: true, default: null },
      campaign: { type: String, trim: true, default: null },
      term: { type: String, trim: true, default: null },
      content: { type: String, trim: true, default: null },
    },
    redirectType: {
      type: Number,
      enum: [301, 302, 307, 308],
      default: 302,
    },
    maxClicks: {
      type: Number,
      default: null,
      min: 1,
    },
    allowedDomains: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    allowedCountries: [{
      type: String,
      trim: true,
      uppercase: true,
      length: 2,
    }],
    blockedCountries: [{
      type: String,
      trim: true,
      uppercase: true,
      length: 2,
    }],
    deviceRestrictions: {
      allowMobile: { type: Boolean, default: true },
      allowDesktop: { type: Boolean, default: true },
      allowTablet: { type: Boolean, default: true },
    },
    qrCode: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      maxlength: 1000,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'urls',
  }
);

urlSchema.index({ userId: 1, createdAt: -1 });
urlSchema.index({ userId: 1, isActive: 1, deletedAt: 1 });
urlSchema.index({ isActive: 1, expiresAt: 1 });
urlSchema.index({ totalClicks: -1, createdAt: -1 });
urlSchema.index({ tags: 1, userId: 1 });
urlSchema.index({ shortCode: 1, isActive: 1, expiresAt: 1 });
urlSchema.index({ title: 'text', description: 'text', tags: 'text' });

urlSchema.methods.isExpired = function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

urlSchema.methods.hasReachedMaxClicks = function () {
  if (!this.maxClicks) return false;
  return this.totalClicks >= this.maxClicks;
};

urlSchema.methods.isAccessible = function () {
  return this.isActive && !this.isExpired() && !this.hasReachedMaxClicks() && !this.deletedAt;
};

urlSchema.methods.incrementClicks = async function () {
  return await this.constructor.findByIdAndUpdate(
    this._id,
    { $inc: { totalClicks: 1 }, $set: { lastClickedAt: new Date() } },
    { new: true }
  );
};

urlSchema.methods.isAllowedInCountry = function (countryCode) {
  if (!countryCode) return true;
  countryCode = countryCode.toUpperCase();
  if (this.blockedCountries?.length > 0) return !this.blockedCountries.includes(countryCode);
  if (this.allowedCountries?.length > 0) return this.allowedCountries.includes(countryCode);
  return true;
};

urlSchema.methods.isAllowedReferrer = function (referrerUrl) {
  if (!this.allowedDomains?.length) return true;
  if (!referrerUrl) return false;
  try {
    const referrerHostname = new URL(referrerUrl).hostname;
    return this.allowedDomains.some(d => referrerHostname === d || referrerHostname.endsWith(`.${d}`));
  } catch {
    return false;
  }
};

urlSchema.methods.isAllowedDevice = function (deviceType) {
  if (!deviceType) return true;
  const restrictions = this.deviceRestrictions;
  if (!restrictions) return true;
  switch (deviceType.toLowerCase()) {
    case 'mobile': return restrictions.allowMobile;
    case 'desktop': return restrictions.allowDesktop;
    case 'tablet': return restrictions.allowTablet;
    default: return true;
  }
};

urlSchema.methods.softDelete = async function () {
  this.deletedAt = new Date();
  this.isActive = false;
  return await this.save();
};

urlSchema.methods.restore = async function () {
  this.deletedAt = null;
  this.isActive = true;
  return await this.save();
};

urlSchema.methods.getFullUrl = function (additionalParams = {}) {
  try {
    const url = new URL(this.originalUrl);
    if (this.utm) {
      if (this.utm.source) url.searchParams.set('utm_source', this.utm.source);
      if (this.utm.medium) url.searchParams.set('utm_medium', this.utm.medium);
      if (this.utm.campaign) url.searchParams.set('utm_campaign', this.utm.campaign);
      if (this.utm.term) url.searchParams.set('utm_term', this.utm.term);
      if (this.utm.content) url.searchParams.set('utm_content', this.utm.content);
    }
    Object.entries(additionalParams).forEach(([key, value]) => url.searchParams.set(key, value));
    return url.toString();
  } catch {
    return this.originalUrl;
  }
};

urlSchema.statics.findActiveByShortCode = async function (shortCode) {
  return await this.findOne({
    shortCode,
    isActive: true,
    deletedAt: null,
    $and: [
      { $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] },
      { $or: [{ maxClicks: null }, { $expr: { $lt: ['$totalClicks', '$maxClicks'] } }] },
    ],
  });
};

urlSchema.statics.deactivateExpired = async function () {
  return await this.updateMany(
    { expiresAt: { $lte: new Date() }, isActive: true, deletedAt: null },
    { $set: { isActive: false } }
  );
};

urlSchema.statics.deactivateMaxClicked = async function () {
  return await this.updateMany(
    { isActive: true, deletedAt: null, maxClicks: { $exists: true, $ne: null }, $expr: { $gte: ['$totalClicks', '$maxClicks'] } },
    { $set: { isActive: false } }
  );
};

urlSchema.statics.findByUser = async function (userId, options = {}) {
  const { page = 1, limit = 10, sort = { createdAt: -1 }, includeDeleted = false } = options;
  const query = { userId, ...(includeDeleted ? {} : { deletedAt: null }) };
  const skip = (page - 1) * limit;
  const [urls, total] = await Promise.all([
    this.find(query).sort(sort).skip(skip).limit(limit).lean(),
    this.countDocuments(query),
  ]);
  return { urls, pagination: { total, page, pages: Math.ceil(total / limit), limit } };
};

urlSchema.statics.findPopular = async function (limit = 10, timeframe = null) {
  const query = { isActive: true, deletedAt: null, isPublic: true };
  if (timeframe) query.createdAt = { $gte: new Date(Date.now() - timeframe) };
  return await this.find(query).sort({ totalClicks: -1, createdAt: -1 }).limit(limit).lean();
};

urlSchema.statics.search = async function (userId, searchTerm, options = {}) {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;
  const query = { userId, deletedAt: null, $text: { $search: searchTerm } };
  const [urls, total] = await Promise.all([
    this.find(query).sort({ score: { $meta: 'textScore' } }).skip(skip).limit(limit).lean(),
    this.countDocuments(query),
  ]);
  return { urls, pagination: { total, page, pages: Math.ceil(total / limit), limit } };
};

urlSchema.statics.getUserStats = async function (userId) {
  const [stats] = await this.aggregate([
    { $match: { userId, deletedAt: null } },
    {
      $group: {
        _id: null,
        totalUrls: { $sum: 1 },
        totalClicks: { $sum: '$totalClicks' },
        activeUrls: { $sum: { $cond: ['$isActive', 1, 0] } },
        expiredUrls: { $sum: { $cond: [{ $and: [{ $ne: ['$expiresAt', null] }, { $lte: ['$expiresAt', new Date()] }] }, 1, 0] } },
      },
    },
  ]);
  return stats || { totalUrls: 0, totalClicks: 0, activeUrls: 0, expiredUrls: 0 };
};

urlSchema.statics.cleanupDeleted = async function (daysOld = 30) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  return await this.deleteMany({ deletedAt: { $lte: cutoffDate } });
};

urlSchema.virtual('shortUrl').get(function () {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/${this.shortCode}`;
});

urlSchema.virtual('qrCodeUrl').get(function () {
  if (!this.qrCode) return null;
  if (this.qrCode.startsWith('http')) return this.qrCode;
  return `data:image/png;base64,${this.qrCode}`;
});

urlSchema.virtual('daysUntilExpiration').get(function () {
  if (!this.expiresAt) return null;
  const now = new Date();
  const diff = this.expiresAt - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

urlSchema.set('toJSON', { virtuals: true, transform: (doc, ret) => { delete ret.__v; return ret; } });
urlSchema.set('toObject', { virtuals: true, transform: (doc, ret) => { delete ret.__v; return ret; } });

module.exports = LinkShortDB.model('Url', urlSchema);