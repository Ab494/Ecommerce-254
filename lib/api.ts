// API service for communicating with the backend
// Replace the internal API routes with external backend calls

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    throw new Error(error.error || 'An error occurred');
  }
  return response.json();
}

export const api = {
  // Products
  products: {
    getAll: async (category?: string): Promise<any[]> => {
      const url = category 
        ? `${API_BASE_URL}/api/products?category=${category}`
        : `${API_BASE_URL}/api/products`;
      const response = await fetch(url);
      return handleResponse<any[]>(response);
    },
    
    getById: async (id: string): Promise<any> => {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
      return handleResponse<any>(response);
    },
    
    create: async (product: any): Promise<any> => {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      return handleResponse<any>(response);
    },
    
    update: async (id: string, product: any): Promise<any> => {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      return handleResponse<any>(response);
    },
    
    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<void>(response);
    },
  },

  // Orders
  orders: {
    getAll: async (): Promise<any[]> => {
      const response = await fetch(`${API_BASE_URL}/api/orders`);
      return handleResponse<any[]>(response);
    },
    
    getById: async (id: string): Promise<any> => {
      const response = await fetch(`${API_BASE_URL}/api/orders/${id}`);
      return handleResponse<any>(response);
    },
    
    create: async (order: any): Promise<any> => {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      return handleResponse<any>(response);
    },
  },

  // Payments
  payments: {
    initiate: async (orderId: string, phoneNumber: string, amount: number): Promise<any> => {
      const response = await fetch(`${API_BASE_URL}/api/payments/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, phoneNumber, amount }),
      });
      return handleResponse<any>(response);
    },
    
    checkStatus: async (checkoutRequestId: string): Promise<any> => {
      const response = await fetch(`${API_BASE_URL}/api/payments/status/${checkoutRequestId}`);
      return handleResponse<any>(response);
    },
  },

  // Upload
  upload: {
    image: async (file: File): Promise<any> => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      return handleResponse<any>(response);
    },
  },
};

export default api;
