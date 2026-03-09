import { Router } from 'express';
import { sendSMS, sendBulkSMS, sendOrderConfirmation, sendPromotionalSMS } from '../utils/sms';

const router = Router();

// Send single SMS
router.post('/send', async (req, res) => {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ 
        error: 'Phone number and message are required' 
      });
    }

    const result = await sendSMS(phone, message);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('SMS send error:', error);
    res.status(500).json({ 
      error: 'Failed to send SMS',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Send bulk SMS
router.post('/bulk', async (req, res) => {
  try {
    const { phones, message } = req.body;

    if (!phones || !Array.isArray(phones) || phones.length === 0) {
      return res.status(400).json({ 
        error: 'Array of phone numbers is required' 
      });
    }

    if (!message) {
      return res.status(400).json({ 
        error: 'Message is required' 
      });
    }

    const result = await sendBulkSMS(phones, message);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Bulk SMS error:', error);
    res.status(500).json({ 
      error: 'Failed to send bulk SMS',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Send promotional SMS
router.post('/promotional', async (req, res) => {
  try {
    const { phones, promotion } = req.body;

    if (!phones || !Array.isArray(phones) || phones.length === 0) {
      return res.status(400).json({ 
        error: 'Array of phone numbers is required' 
      });
    }

    if (!promotion) {
      return res.status(400).json({ 
        error: 'Promotion message is required' 
      });
    }

    const result = await sendPromotionalSMS(phones, promotion);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Promotional SMS error:', error);
    res.status(500).json({ 
      error: 'Failed to send promotional SMS',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Send order confirmation SMS
router.post('/order-confirmation', async (req, res) => {
  try {
    const { phone, orderId, total } = req.body;

    if (!phone || !orderId || !total) {
      return res.status(400).json({ 
        error: 'Phone, orderId, and total are required' 
      });
    }

    const result = await sendOrderConfirmation(phone, orderId, total);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Order confirmation SMS error:', error);
    res.status(500).json({ 
      error: 'Failed to send order confirmation SMS',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test endpoint - verify SMS configuration
router.get('/test', async (req, res) => {
  try {
    const apiKey = process.env.BLESSEDTEXTS_API_KEY;
    const sender = process.env.BLESSEDTEXTS_SENDER;
    
    if (!apiKey) {
      return res.status(500).json({ 
        configured: false,
        error: 'BlessedTexts API key not configured' 
      });
    }

    res.json({ 
      configured: true,
      sender: sender || '254CONVEX',
      message: 'SMS configuration is valid'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'SMS test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
