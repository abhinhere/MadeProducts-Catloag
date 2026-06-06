export type Role = 'ADMIN' | 'EMPLOYEE';

export interface User {
  id: string;
  supabaseId: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  createdAt: Date;
  _count?: { products: number };
}

export interface PriceSlab {
  id: string;
  productId: string;
  quantity: number;
  price: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  description?: string | null;
  width?: number | null;
  height?: number | null;
  gusset?: number | null;
  gsm?: number | null;
  material?: string | null;
  handleType?: string | null;
  printingType?: string | null;
  color?: string | null;
  moq?: number | null;
  createdAt: Date;
  updatedAt: Date;
  category: Category;
  images: ProductImage[];
  priceSlabs: PriceSlab[];
}

export interface PriceHistory {
  id: string;
  productId: string;
  quantity: number;
  oldPrice?: string | null;
  newPrice: string;
  changedAt: Date;
  action: string;
  product: { name: string };
  changedBy: { name: string };
}

export interface Settings {
  id: string;
  companyName: string;
  companyLogo?: string | null;
  companyPhone?: string | null;
  companyWhatsapp?: string | null;
  companyAddress?: string | null;
  shareFooter?: string | null;
}

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalEmployees: number;
  recentPriceUpdates: PriceHistory[];
}
