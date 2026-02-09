/**
 * Migration script to upload local images to Cloudinary
 * and update MongoDB product records with new URLs
 * 
 * Usage: npx ts-node -r dotenv/config scripts/migrate-images-to-cloudinary.ts
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce254';

// Product schema
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  stock: Number,
  images: [String],
  category: String,
  sku: String,
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// Local images directory
const UPLOADS_DIR = path.join(__dirname, '../uploads/products');

async function migrateImages() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all image files from uploads directory
    if (!fs.existsSync(UPLOADS_DIR)) {
      console.log('Uploads directory not found');
      return;
    }

    const files = fs.readdirSync(UPLOADS_DIR);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'].includes(ext);
    });

    console.log(`Found ${imageFiles.length} images to migrate`);

    // Find products with local image URLs
    const localUrlPattern = /localhost:3001\/uploads\/products/;
    const products = await Product.find({
      images: { $regex: localUrlPattern }
    });

    console.log(`Found ${products.length} products with local images`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      const newImages: string[] = [];

      for (const imageUrl of product.images) {
        if (localUrlPattern.test(imageUrl)) {
          // Extract filename from URL
          const filename = imageUrl.split('/').pop();
          const localPath = path.join(UPLOADS_DIR, filename!);

          if (fs.existsSync(localPath)) {
            console.log(`Uploading ${filename} to Cloudinary...`);

            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(localPath, {
              folder: 'ecommerce/products',
              transformation: [
                { width: 800, height: 800, crop: 'limit' },
                { quality: 'auto:good' }
              ]
            });

            newImages.push(result.secure_url);
            console.log(`  → ${result.secure_url}`);
          } else {
            console.log(`  File not found: ${filename}`);
            skippedCount++;
          }
        } else {
          // Already a Cloudinary URL or external URL
          newImages.push(imageUrl);
        }
      }

      if (newImages.length > 0) {
        product.images = newImages;
        await product.save();
        migratedCount++;
        console.log(`  Updated product: ${product.name}`);
      }
    }

    console.log('\nMigration complete!');
    console.log(`  Products migrated: ${migratedCount}`);
    console.log(`  Images skipped (file not found): ${skippedCount}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrateImages();
