/**
 * BlessedTexts SMS Utility
 * API Documentation: https://sms.blessedtexts.com/api/sms/v1
 */

interface SMSResponse {
  success: boolean;
  message: string;
  messageId?: string;
  error?: string;
}

interface SMSApiResponse {
  status_code?: string;
  status_desc?: string;
  message_id?: string;
  phone?: string;
  message_cost?: string;
  error?: string;
}

interface BulkSMSResponse {
  success: boolean;
  message: string;
  sentCount?: number;
  failedCount?: number;
  results?: Array<{
    phone: string;
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
  error?: string;
}

/**
 * Send a single SMS message
 */
export async function sendSMS(phone: string, message: string): Promise<SMSResponse> {
  console.log('=== sendSMS called ===');
  console.log('Phone:', phone);
  console.log('Message:', message);
  
  const apiKey = process.env.BLESSEDTEXTS_API_KEY;
  const senderId = process.env.BLESSEDTEXTS_SENDER || 'FERRITE';

  if (!apiKey) {
    console.log('API key not configured');
    return {
      success: false,
      message: 'API key not configured',
      error: 'API key not configured'
    };
  }

  // Format phone number
  let formattedPhone = phone.replace(/[^\d+]/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.substring(1);
  }
  if (!formattedPhone.startsWith('+') && !formattedPhone.startsWith('254')) {
    formattedPhone = '254' + formattedPhone;
  }

  console.log('Formatted phone:', formattedPhone);

  const postData = JSON.stringify({
    api_key: apiKey,
    sender_id: senderId,
    phone: formattedPhone,
    message: message
  });

  const url = 'https://sms.blessedtexts.com/api/sms/v1/sendsms';
  
  console.log('Making request to:', url);
  console.log('Post data:', postData);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: postData
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response:', errorText);
      return {
        success: false,
        message: 'Failed to send SMS',
        error: `HTTP error: ${response.status}`
      };
    }

    const data = await response.json() as SMSApiResponse[];
    console.log('Response data:', JSON.stringify(data));

    // Handle array response - API returns array even for single SMS
    if (Array.isArray(data) && data.length > 0) {
      const smsData = data[0];
      if (smsData.status_code === '1000') {
        return {
          success: true,
          message: 'SMS sent successfully',
          messageId: smsData.message_id
        };
      } else {
        return {
          success: false,
          message: smsData.status_desc || 'Failed to send SMS',
          error: smsData.error || smsData.status_desc
        };
      }
    }
    
    return {
      success: false,
      message: 'Failed to send SMS',
      error: 'Invalid response from SMS API'
    };
  } catch (err: any) {
    console.error('SMS Error:', err);
    return {
      success: false,
      message: 'Failed to send SMS',
      error: err.message || 'Unknown error'
    };
  }
}

/**
 * Send bulk SMS to multiple recipients
 */
export async function sendBulkSMS(phones: string[], message: string): Promise<BulkSMSResponse> {
  const apiKey = process.env.BLESSEDTEXTS_API_KEY;
  const senderId = process.env.BLESSEDTEXTS_SENDER || 'FERRITE';

  if (!apiKey) {
    return {
      success: false,
      message: 'API key not configured',
      error: 'API key not configured'
    };
  }

  // Format all phone numbers
  const formattedPhones = phones.map(phone => {
    let formatted = phone.replace(/[^\d+]/g, '');
    if (formatted.startsWith('0')) {
      formatted = '254' + formatted.substring(1);
    }
    if (!formatted.startsWith('+') && !formatted.startsWith('254')) {
      formatted = '254' + formatted;
    }
    return formatted;
  });

  const postData = JSON.stringify({
    api_key: apiKey,
    sender_id: senderId,
    phone: formattedPhones.join(','),
    message: message
  });

  const url = 'https://sms.blessedtexts.com/api/sms/v1/sendsms';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: postData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as SMSApiResponse[];

    if (Array.isArray(data) && data.length > 0) {
      const results = data.map((item: SMSApiResponse) => ({
        phone: item.phone || '',
        success: item.status_code === '1000',
        messageId: item.message_id,
        error: item.status_desc
      }));
      
      const sentCount = results.filter(r => r.success).length;
      const failedCount = results.filter(r => !r.success).length;

      return {
        success: sentCount > 0,
        message: `Sent ${sentCount} SMS, ${failedCount} failed`,
        sentCount,
        failedCount,
        results
      };
    } else {
      return {
        success: false,
        message: 'Failed to send bulk SMS',
        failedCount: phones.length
      };
    }
  } catch (err: any) {
    console.error('Bulk SMS Error:', err);
    return {
      success: false,
      message: 'Failed to send bulk SMS',
      failedCount: phones.length,
      error: err.message
    };
  }
}

/**
 * Send order confirmation SMS to customer
 */
export async function sendOrderConfirmation(phone: string, orderId: string, total: number): Promise<SMSResponse> {
  const msg = `Thank you for your order #${orderId}! Your order of KES ${total.toLocaleString()} has been received and is being processed. We'll notify you when it's shipped. - 254 Convex Comm LTD`;
  return sendSMS(phone, msg);
}

/**
 * Send order shipped SMS to customer
 */
export async function sendOrderShipped(phone: string, orderId: string): Promise<SMSResponse> {
  const msg = `Your order #${orderId} has been shipped! Track your delivery at our website. Thank you for shopping with 254 Convex Comm LTD.`;
  return sendSMS(phone, msg);
}

/**
 * Send order delivered SMS to customer
 */
export async function sendOrderDelivered(phone: string, orderId: string): Promise<SMSResponse> {
  const msg = `Your order #${orderId} has been delivered! Thank you for your purchase. Please leave a review. - 254 Convex Comm LTD`;
  return sendSMS(phone, msg);
}

/**
 * Send promotional SMS
 */
export async function sendPromotionalSMS(phones: string[], promotion: string): Promise<BulkSMSResponse> {
  const msg = `🎉 ${promotion} Shop now at 254 Convex Comm LTD! Visit our website or call 0722745703. Valid while stocks last.`;
  return sendBulkSMS(phones, msg);
}
