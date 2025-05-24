import mongoose, { Document, Schema } from 'mongoose';

interface Visit {
  timestamp: Date;
  country?: string;
  city?: string;
  referrer?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  platform?: string;
  ip?: string;
}

export interface IShortUrl extends Document {
  shortcode: string;
  domain: string;
  deviceId: string;
  originalUrl: string;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
  metaTags: {
    title?: string;
    description?: string;
    favicon?: string;
    ogImage?: string;
  };
  visits: Visit[];
}

const VisitSchema = new Schema<Visit>({
  timestamp: { type: Date, default: Date.now },
  country: String,
  city: String,
  referrer: String,
  deviceType: String,
  browser: String,
  os: String,
  platform: String,
  ip: String,
});

const ShortUrlSchema: Schema = new Schema(
  {
    shortcode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    domain: {
      type: String,
      required: true,
      trim: true,
    },
    deviceId: {
      type: String,
      required: true,
      trim: true,
    },
    originalUrl: {
      type: String,
      required: true,
      trim: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    metaTags: {
      title: String,
      description: String,
      favicon: String,
      ogImage: String,
    },
    visits: [VisitSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

ShortUrlSchema.index({ shortcode: 1 });
ShortUrlSchema.index({ deviceId: 1 });

export default mongoose.model<IShortUrl>('ShortUrl', ShortUrlSchema);
