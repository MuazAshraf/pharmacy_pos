export interface Medicine {
  id: number;
  saltName: string;
  brandName: string;
  actualPrice: number;
  discountedPrice: number;
  quantity: number;
  unit: string;
  expiryDate: string;
  shelfNo: string;
}

export interface CartItem extends Medicine {
  billQuantity: number;
}

export interface BillItem {
  id: number;
  billId: number;
  medicineId: number;
  quantity: number;
  price: number;
}

export interface Bill {
  id?: number;
  total: number;
  createdAt: Date;
  items: CartItem[];
}

export interface User {
  id: number;
  username: string;
  password: string;
  created_at: Date;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: number;
    username: string;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: number;
    username: string;
  } | null;
}

