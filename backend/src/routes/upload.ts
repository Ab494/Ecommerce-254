import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

const router = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req: Request, file: Express.Multer.File, cb: Function) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Helper function to upload from buffer
const uploadFromBuffer = (file: Express.Multer.File): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'ecommerce/products',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto:good' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({ url: result.secure_url, publicId: result.public_id });
        } else {
          reject(new Error('No result from Cloudinary'));
        }
      }
    );
    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

// POST upload single image
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const result = await uploadFromBuffer(file);

    res.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// POST upload multiple images
router.post('/multiple', upload.array('files', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const result = await uploadFromBuffer(file);
        return {
          success: true,
          url: result.url,
          publicId: result.publicId,
        };
      })
    );

    res.json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// DELETE delete uploaded file from Cloudinary
router.delete('/:publicId', async (req: Request, res: Response) => {
  try {
    const { publicId } = req.params;

    // Decode the publicId if it contains URL-encoded characters
    const decodedPublicId = decodeURIComponent(publicId);

    const result = await cloudinary.uploader.destroy(decodedPublicId);

    if (result.result === 'ok') {
      res.json({ success: true, message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;
