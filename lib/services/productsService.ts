import { API_ENDPOINTS } from '../config/api';
import adminAuthService from './adminAuthService';

interface ProductData {
  slug: string;
  name: string;
  price: number;
  currency: string;
  shortDesc?: string;
  categoryIds?: string[];
}

/**
 * Products Service
 * Handles product-related API calls (public and admin)
 */

class ProductsService {
  /**
   * Get all products (public, paginated)
   * @param page - Page number (default: 1)
   * @param size - Page size (default: 20)
   * @returns Products list with pagination
   */
  async getProducts(page = 1, size = 20): Promise<unknown> {
    try {
      const url = `${API_ENDPOINTS.PRODUCTS}?page=${page}&size=${size}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      return await response.json();
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  }

  /**
   * Get product by slug (public)
   * @param slug - Product slug
   * @returns Product details
   */
  async getProductBySlug(slug: string): Promise<unknown> {
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCT_BY_SLUG(slug));

      if (!response.ok) {
        throw new Error('Product not found');
      }

      return await response.json();
    } catch (error) {
      console.error('Get product by slug error:', error);
      throw error;
    }
  }

  /**
   * Get all products (admin view, requires authentication)
   * @param page - Page number (default: 1)
   * @param size - Page size (default: 20)
   * @returns Products list with pagination
   */
  async getProductsAdmin(page = 1, size = 20): Promise<unknown> {
    try {
      const url = `${API_ENDPOINTS.PRODUCTS_ADMIN}?page=${page}&size=${size}`;
      const headers = adminAuthService.getAuthHeaders();

      console.log('Fetching admin products with headers:', headers);
      console.log('Token:', adminAuthService.getToken() ? 'Present' : 'Missing');

      const response = await fetch(url, {
        headers: headers,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. Admin role required.');
        }
        if (response.status === 500) {
          const errorData = await response.json().catch(() => ({}));
          const errorDetail = (errorData as any).detail || (errorData as any).error || (errorData as any).message || '';

          // Check if it's a Cloudinary configuration error
          if (errorDetail.includes('CLOUDINARY') || errorDetail.includes('cloudinary')) {
            throw new Error(`Backend configuration error: ${errorDetail}`);
          }

          throw new Error(errorDetail || 'Server error occurred. Please try again later.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData as any).error || (errorData as any).message || 'Failed to fetch products (admin)');
      }

      return await response.json();
    } catch (error) {
      console.error('Get products admin error:', error);
      throw error;
    }
  }

  /**
   * Create a new product (admin only)
   * @param productData - { slug, name, price, currency, shortDesc }
   * @returns Created product
   */
  async createProduct(productData: ProductData): Promise<unknown> {
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCTS_ADMIN, {
        method: 'POST',
        headers: adminAuthService.getAuthHeaders(),
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as any).message || 'Failed to create product');
      }

      return await response.json();
    } catch (error) {
      console.error('Create product error:', error);
      throw error;
    }
  }

  /**
   * Update existing product (admin only)
   * @param productId - Product ID
   * @param productData - { slug, name, price, currency, shortDesc }
   * @returns Updated product
   */
  async updateProduct(productId: string | number, productData: ProductData): Promise<unknown> {
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCT_ADMIN_BY_ID(productId), {
        method: 'PUT',
        headers: adminAuthService.getAuthHeaders(),
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as any).message || 'Failed to update product');
      }

      return await response.json();
    } catch (error) {
      console.error('Update product error:', error);
      throw error;
    }
  }

  /**
   * Delete product (admin only)
   * @param productId - Product ID
   * @returns void
   */
  async deleteProduct(productId: string | number): Promise<boolean> {
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCT_ADMIN_BY_ID(productId), {
        method: 'DELETE',
        headers: adminAuthService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      return true;
    } catch (error) {
      console.error('Delete product error:', error);
      throw error;
    }
  }

  /**
   * Get product images (admin only)
   * @param productId - Product ID
   * @returns List of product images
   */
  async getProductImages(productId: string | number): Promise<unknown[]> {
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCT_IMAGES(productId), {
        headers: adminAuthService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product images');
      }

      return await response.json();
    } catch (error) {
      console.error('Get product images error:', error);
      throw error;
    }
  }

  /**
   * Upload product images (admin only)
   * @param productId - Product ID
   * @param images - Image files (max 5)
   * @returns Upload response with uploaded images
   */
  async uploadProductImages(productId: string | number, images: FileList | File[]): Promise<unknown> {
    try {
      const formData = new FormData();

      // Add all images to FormData
      Array.from(images).forEach((image) => {
        formData.append('images', image);
      });

      const token = adminAuthService.getToken();
      const response = await fetch(API_ENDPOINTS.PRODUCT_IMAGES(productId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type - browser will set it with boundary for FormData
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as any).error || 'Failed to upload images');
      }

      return await response.json();
    } catch (error) {
      console.error('Upload product images error:', error);
      throw error;
    }
  }

  /**
   * Delete product image (admin only)
   * @param productId - Product ID
   * @param imageId - Image ID
   * @returns Delete response
   */
  async deleteProductImage(productId: string | number, imageId: string | number): Promise<unknown> {
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCT_IMAGE_DELETE(productId, imageId), {
        method: 'DELETE',
        headers: adminAuthService.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as any).error || 'Failed to delete image');
      }

      return await response.json();
    } catch (error) {
      console.error('Delete product image error:', error);
      throw error;
    }
  }

  /**
   * Set main product image (admin only)
   * @param productId - Product ID
   * @param imageId - Image ID
   * @returns Update response
   */
  async setMainProductImage(productId: string | number, imageId: string | number): Promise<unknown> {
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCT_IMAGE_SET_MAIN(productId, imageId), {
        method: 'POST',
        headers: adminAuthService.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as any).error || 'Failed to set main image');
      }

      return await response.json();
    } catch (error) {
      console.error('Set main product image error:', error);
      throw error;
    }
  }
}

export default new ProductsService();
