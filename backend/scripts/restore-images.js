// Script to restore images to products based on existing uploads
// This script matches product image URLs with uploaded files

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Product Schema (same as in routes/products.ts)
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  image: String,
  images: [String],
  stock: Number,
  sku: String,
  featured: Boolean,
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Get list of uploaded files
function getUploadedFiles() {
  const uploadDir = path.join(__dirname, '../uploads/products');
  if (!fs.existsSync(uploadDir)) {
    console.log('Upload directory not found');
    return [];
  }
  return fs.readdirSync(uploadDir);
}

async function restoreImages() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('Please set MONGODB_URI environment variable');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const files = getUploadedFiles();
    console.log('Found ' + files.length + ' uploaded files');

    // Get all products
    const products = await Product.find({});
    console.log('Found ' + products.length + ' products');

    // Update products with additional images
    let updatedCount = 0;

    for (const product of products) {
      const additionalImages = [];

      files.forEach(file => {
        // Skip if this is the main image
        const mainImageFilename = product.image ? product.image.split('/').pop() : null;
        if (file === mainImageFilename) return;

        // Check if filename contains product SKU or name keywords
        const productKeywords = (product.sku || product.name).toLowerCase().split(/[\s-]+/);
        
        let matchScore = 0;
        productKeywords.forEach(keyword => {
          if (keyword.length > 2 && file.toLowerCase().includes(keyword)) {
            matchScore++;
          }
        });

        if (matchScore > 0) {
          const imageUrl = 'http://localhost:3001/uploads/products/' + file;
          if (!product.images.includes(imageUrl)) {
            additionalImages.push(imageUrl);
          }
        }
      });

      if (additionalImages.length > 0) {
        // Merge new images with existing ones, avoiding duplicates
        const existingImages = [...product.images];
        additionalImages.forEach(img => {
          if (!existingImages.includes(img)) {
            existingImages.push(img);
          }
        });

        if (existingImages.length > product.images.length) {
          await Product.findByIdAndUpdate(product._id, {
            images: existingImages
          });
          console.log('Updated ' + product.name + ': added ' + additionalImages.length + ' images');
          updatedCount++;
        }
      }
    }

    console.log('\nTotal products updated: ' + updatedCount);
    console.log('Note: Some images may not have been matched automatically.');
    console.log('You may need to manually add images to products that were not updated.');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

restoreImages();
