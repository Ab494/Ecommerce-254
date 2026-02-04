import axios from 'axios';

const DARAJA_AUTH_URL = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
const DARAJA_STK_PUSH_URL = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
const DARAJA_QUERY_URL = 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query';

const consumerKey = process.env.DARAJA_CONSUMER_KEY;
const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
const businessShortcode = process.env.DARAJA_BUSINESS_SHORTCODE;
const passkey = process.env.DARAJA_PASSKEY;

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken() {
  try {
    if (accessToken && Date.now() < tokenExpiry) {
      return accessToken;
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    const response = await axios.get(DARAJA_AUTH_URL, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;

    return accessToken;
  } catch (error) {
    console.error('Error getting Daraja access token:', error);
    throw new Error('Failed to authenticate with M-Pesa');
  }
}

function generateTimestamp() {
  return new Date()
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, -3);
}

function generatePassword(shortCode: string, passKey: string, timestamp: string) {
  const str = shortCode + passKey + timestamp;
  return Buffer.from(str).toString('base64');
}

export async function initiateSTKPush(
  phoneNumber: string,
  amount: number,
  orderId: string
) {
  try {
    const token = await getAccessToken();
    const timestamp = generateTimestamp();
    const password = generatePassword(
      businessShortcode!,
      passkey!,
      timestamp
    );

    // Format phone number to 254XXXXXXXXX format
    let formattedPhone = phoneNumber.replace(/^0/, '254');
    if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    const response = await axios.post(
      DARAJA_STK_PUSH_URL,
      {
        BusinessShortCode: businessShortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: businessShortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback`,
        AccountReference: orderId,
        TransactionDesc: `Payment for order ${orderId}`,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error initiating STK push:', error);
    throw new Error('Failed to initiate M-Pesa payment');
  }
}

export async function querySTKStatus(
  checkoutRequestId: string
) {
  try {
    const token = await getAccessToken();
    const timestamp = generateTimestamp();
    const password = generatePassword(
      businessShortcode!,
      passkey!,
      timestamp
    );

    const response = await axios.post(
      DARAJA_QUERY_URL,
      {
        BusinessShortCode: businessShortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error querying STK status:', error);
    throw new Error('Failed to query payment status');
  }
}
