const mongoose = require('mongoose');

const DailyAggregateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    dateKey: {
      type: String,
      required: true
    },
    locationKey: {
      type: String,
      required: true
    },
    location: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      city: { type: String, default: null },
      district: { type: String, default: null },
      state: { type: String, default: null },
      country: { type: String, default: null },
      point: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number],
          default: undefined
        }
      }
    },
    totalDistance: {
      type: Number,
      default: 0,
      min: 0
    },
    totalDuration: {
      type: Number,
      default: 0,
      min: 0
    },
    totalRuns: {
      type: Number,
      default: 0,
      min: 0
    },
    caloriesBurned: {
      type: Number,
      default: 0,
      min: 0
    },
    elevationGain: {
      type: Number,
      default: 0,
      min: 0
    },
    lastRunAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

DailyAggregateSchema.index({ userId: 1, dateKey: 1, locationKey: 1 }, { unique: true });
DailyAggregateSchema.index({ dateKey: 1, 'location.city': 1, totalDistance: -1 });
DailyAggregateSchema.index({ dateKey: 1, 'location.district': 1, totalDistance: -1 });
DailyAggregateSchema.index({ dateKey: 1, 'location.state': 1, totalDistance: -1 });
DailyAggregateSchema.index({ dateKey: 1, 'location.country': 1, totalDistance: -1 });
DailyAggregateSchema.index({ 'location.point': '2dsphere' });

module.exports = mongoose.model('DailyAggregate', DailyAggregateSchema);
