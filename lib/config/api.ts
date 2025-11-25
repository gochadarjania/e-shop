// API Configuration
const API_BASE_URL = 'https://65.108.50.33';

export const API_ENDPOINTS = {
  // Authentication
  REGISTER: `${API_BASE_URL}/connect/register`,
  LOGIN: `${API_BASE_URL}/connect/token`,
  USER_INFO: `${API_BASE_URL}/connect/userinfo`,
  ADMIN_LOGIN: `${API_BASE_URL}/admin/connect/token`,
  ADMIN_USER_INFO: `${API_BASE_URL}/admin/connect/userinfo`,

  // Products (Public)
  PRODUCTS: `${API_BASE_URL}/api/products`,
  PRODUCT_BY_SLUG: (slug: string) => `${API_BASE_URL}/api/products/${slug}`,

  // Products (Admin)
  PRODUCTS_ADMIN: `${API_BASE_URL}/admin/products`,
  PRODUCT_ADMIN_BY_ID: (id: string | number) => `${API_BASE_URL}/admin/products/${id}`,
  PRODUCT_IMAGES: (productId: string | number) => `${API_BASE_URL}/admin/products/${productId}/images`,
  PRODUCT_IMAGE_DELETE: (productId: string | number, imageId: string | number) => `${API_BASE_URL}/admin/products/${productId}/images/${imageId}`,
  PRODUCT_IMAGE_SET_MAIN: (productId: string | number, imageId: string | number) => `${API_BASE_URL}/admin/products/${productId}/images/${imageId}/set-main`,

  // Cart
  CART: `${API_BASE_URL}/api/cart`,
  CART_ITEMS: `${API_BASE_URL}/api/cart/items`,
  CART_ITEM: (itemId: string | number) => `${API_BASE_URL}/api/cart/items/${itemId}`,

  // Orders
  ORDERS: `${API_BASE_URL}/api/orders`,

  // Categories (Public)
  CATEGORIES: `${API_BASE_URL}/api/categories`,
  CATEGORY_BY_SLUG: (slug: string) => `${API_BASE_URL}/api/categories/slug/${slug}`,
  CATEGORIES_HOME: `${API_BASE_URL}/api/categories/home`,
  CATEGORY_PRODUCTS_PUBLIC: (categoryId: string) => `${API_BASE_URL}/api/categories/${categoryId}/products`,

  // Categories (Admin)
  CATEGORIES_ADMIN: `${API_BASE_URL}/admin/categories`,
  CATEGORY_ADMIN_BY_ID: (id: string) => `${API_BASE_URL}/admin/categories/${id}`,
  CATEGORY_IMAGE: (id: string) => `${API_BASE_URL}/admin/categories/${id}/image`,

  // Product-Category Relationships (Admin)
  PRODUCT_CATEGORIES: (productId: string | number) => `${API_BASE_URL}/admin/categories/products/${productId}/categories`,
  ADD_PRODUCT_TO_CATEGORY: (productId: string | number, categoryId: string) => `${API_BASE_URL}/admin/categories/products/${productId}/categories/${categoryId}`,
  REMOVE_PRODUCT_FROM_CATEGORY: (productId: string | number, categoryId: string) => `${API_BASE_URL}/admin/categories/products/${productId}/categories/${categoryId}`,
  CATEGORY_PRODUCTS: (categoryId: string) => `${API_BASE_URL}/admin/categories/${categoryId}/products`,

  // Health
  HEALTH: `${API_BASE_URL}/health`,
};

export default API_BASE_URL;
