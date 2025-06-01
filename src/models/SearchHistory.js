import mongoose from "mongoose";

const searchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    query: {
      text: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, "Search query cannot exceed 500 characters"],
      },
      type: {
        type: String,
        enum: ["crop", "weather", "disease", "pest", "general", "location"],
        required: true,
      },
      category: {
        type: String,
        enum: ["recommendation", "information", "diagnosis", "planning"],
      },
    },
    filters: {
      location: {
        name: String,
        coordinates: {
          latitude: Number,
          longitude: Number,
        },
      },
      season: {
        type: String,
        enum: ["kharif", "rabi", "zaid", "year_round"],
      },
      cropType: {
        type: String,
        enum: [
          "cereal",
          "pulse",
          "oilseed",
          "vegetable",
          "fruit",
          "spice",
          "cash_crop",
          "fodder",
        ],
      },
      soilType: {
        type: String,
        enum: ["clay", "sandy", "loamy", "silty", "peaty", "chalky"],
      },
      farmSize: {
        min: Number,
        max: Number,
        unit: {
          type: String,
          enum: ["acres", "hectares", "square_meters"],
          default: "acres",
        },
      },
      dateRange: {
        start: Date,
        end: Date,
      },
    },
    results: {
      count: {
        type: Number,
        default: 0,
      },
      items: [
        {
          id: String,
          title: String,
          type: String,
          relevanceScore: {
            type: Number,
            min: 0,
            max: 100,
          },
          clicked: {
            type: Boolean,
            default: false,
          },
          clickedAt: Date,
        },
      ],
      responseTime: {
        type: Number, // in milliseconds
        default: 0,
      },
      dataSource: [String],
    },
    interaction: {
      clicked: {
        type: Boolean,
        default: false,
      },
      saved: {
        type: Boolean,
        default: false,
      },
      shared: {
        type: Boolean,
        default: false,
      },
      feedback: {
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        helpful: Boolean,
      },
      timeSpent: {
        type: Number, // in seconds
        default: 0,
      },
    },
    context: {
      userAgent: String,
      ip: String,
      referrer: String,
      sessionId: String,
      deviceType: {
        type: String,
        enum: ["desktop", "mobile", "tablet"],
      },
      language: {
        type: String,
        default: "en",
      },
    },
    tags: [String],
    isBookmarked: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    metadata: {
      searchIntent: {
        type: String,
        enum: ["informational", "navigational", "transactional", "commercial"],
      },
      searchComplexity: {
        type: String,
        enum: ["simple", "moderate", "complex"],
      },
      aiGenerated: {
        type: Boolean,
        default: false,
      },
      processingTime: Number, // in milliseconds
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
searchHistorySchema.index({ user: 1, createdAt: -1 });
searchHistorySchema.index({ "query.type": 1 });
searchHistorySchema.index({ "query.text": "text" });
searchHistorySchema.index({ "filters.location.coordinates": "2dsphere" });
searchHistorySchema.index({ isBookmarked: 1 });

// TTL index to automatically delete old search history after 1 year
searchHistorySchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 365 * 24 * 60 * 60 }
);

// Virtual for search summary
searchHistorySchema.virtual("summary").get(function () {
  return {
    query: this.query.text,
    type: this.query.type,
    resultCount: this.results.count,
    timestamp: this.createdAt,
  };
});

// Static method to get user's search history
searchHistorySchema.statics.getUserHistory = function (userId, options = {}) {
  const {
    limit = 50,
    type = null,
    startDate = null,
    endDate = null,
    bookmarkedOnly = false,
  } = options;

  const query = { user: userId };

  if (type) query["query.type"] = type;
  if (bookmarkedOnly) query.isBookmarked = true;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("user", "name email");
};

// Static method to get popular searches
searchHistorySchema.statics.getPopularSearches = function (options = {}) {
  const {
    limit = 10,
    type = null,
    timeRange = 30, // days
  } = options;

  const matchStage = {
    createdAt: { $gte: new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000) },
  };

  if (type) matchStage["query.type"] = type;

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$query.text",
        count: { $sum: 1 },
        type: { $first: "$query.type" },
        avgResponseTime: { $avg: "$results.responseTime" },
        avgResults: { $avg: "$results.count" },
        lastSearched: { $max: "$createdAt" },
      },
    },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);
};

// Static method to get search analytics
searchHistorySchema.statics.getAnalytics = function (
  userId = null,
  timeRange = 30
) {
  const matchStage = {
    createdAt: { $gte: new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000) },
  };

  if (userId) matchStage.user = new mongoose.Types.ObjectId(userId);

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalSearches: { $sum: 1 },
        uniqueUsers: { $addToSet: "$user" },
        avgResponseTime: { $avg: "$results.responseTime" },
        avgResultCount: { $avg: "$results.count" },
        clickThroughRate: {
          $avg: { $cond: [{ $eq: ["$interaction.clicked", true] }, 1, 0] },
        },
        bookmarkRate: {
          $avg: { $cond: [{ $eq: ["$isBookmarked", true] }, 1, 0] },
        },
        searchTypes: {
          $push: "$query.type",
        },
      },
    },
    {
      $project: {
        totalSearches: 1,
        uniqueUsers: { $size: "$uniqueUsers" },
        avgResponseTime: { $round: ["$avgResponseTime", 2] },
        avgResultCount: { $round: ["$avgResultCount", 2] },
        clickThroughRate: {
          $round: [{ $multiply: ["$clickThroughRate", 100] }, 2],
        },
        bookmarkRate: { $round: [{ $multiply: ["$bookmarkRate", 100] }, 2] },
        searchTypes: 1,
      },
    },
  ]);
};

// Static method to get search trends
searchHistorySchema.statics.getSearchTrends = function (timeRange = 30) {
  const startDate = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000);

  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          type: "$query.type",
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.date": 1 } },
    {
      $group: {
        _id: "$_id.date",
        searches: {
          $push: {
            type: "$_id.type",
            count: "$count",
          },
        },
        total: { $sum: "$count" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

// Instance method to mark as clicked
searchHistorySchema.methods.markClicked = function (resultId = null) {
  this.interaction.clicked = true;

  if (resultId) {
    const result = this.results.items.find((item) => item.id === resultId);
    if (result) {
      result.clicked = true;
      result.clickedAt = new Date();
    }
  }

  return this.save();
};

// Instance method to add feedback
searchHistorySchema.methods.addFeedback = function (
  rating,
  comment = "",
  helpful = null
) {
  this.interaction.feedback = {
    rating,
    comment,
    helpful,
  };

  return this.save();
};

// Instance method to bookmark search
searchHistorySchema.methods.bookmark = function () {
  this.isBookmarked = true;
  return this.save();
};

// Instance method to get similar searches
searchHistorySchema.methods.getSimilarSearches = function (limit = 5) {
  return this.constructor
    .find({
      _id: { $ne: this._id },
      user: this.user,
      "query.type": this.query.type,
      $text: { $search: this.query.text },
    })
    .limit(limit)
    .sort({ score: { $meta: "textScore" } });
};

// Instance method to calculate relevance score
searchHistorySchema.methods.calculateRelevance = function () {
  let score = 0;

  // Base score for having results
  if (this.results.count > 0) score += 20;

  // Score for user interaction
  if (this.interaction.clicked) score += 30;
  if (this.interaction.saved) score += 25;
  if (this.interaction.shared) score += 15;

  // Score for feedback
  if (this.interaction.feedback.rating) {
    score += this.interaction.feedback.rating * 6; // Max 30 points
  }

  // Score for time spent (more time = more relevant)
  if (this.interaction.timeSpent > 60) score += 10; // More than 1 minute

  return Math.min(score, 100); // Cap at 100
};

export default mongoose.model("SearchHistory", searchHistorySchema);
