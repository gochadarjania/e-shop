import { API_ENDPOINTS } from '../config/api';
import adminAuthService from './adminAuthService';

interface CategoryData {
  name: string;
  slug: string;
  description?: string;
  parentCategoryId?: string | null;
  displayOrder: number;
  isActive?: boolean;
  showOnHomePage?: boolean;
}

/**
 * Category Service
 * Handles category-related API calls (admin)
 */

class CategoryService {
  /**
   * Get active categories (public, paginated)
   * @param page - Page number (default: 1)
   * @param size - Page size (default: 20)
   * @returns Categories list with pagination
   */
  async getCategories(page = 1, size = 20): Promise<unknown> {
    try {
      const url = `${API_ENDPOINTS.CATEGORIES}?page=${page}&size=${size}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      return await response.json();
    } catch (error) {
      console.error('Get categories error:', error);
      throw error;
    }
  }

  /**
   * Get categories configured for the home page (public)
   * @param take - Max number of categories to return
   */
  async getHomeCategories(take = 6): Promise<unknown> {
    try {
      const url = `${API_ENDPOINTS.CATEGORIES_HOME}?take=${take}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch home categories');
      }

      return await response.json();
    } catch (error) {
      console.error('Get home categories error:', error);
      throw error;
    }
  }

  /**
   * Get category by slug (public)
   * @param slug - Category slug
   * @returns Category details
   */
  async getCategoryBySlug(slug: string): Promise<unknown> {
    try {
      const response = await fetch(API_ENDPOINTS.CATEGORY_BY_SLUG(slug));

      if (!response.ok) {
        throw new Error('Category not found');
      }

      return await response.json();
    } catch (error) {
      console.error('Get category by slug error:', error);
      throw error;
    }
  }

  /**
   * Get all categories (admin, paginated)
   * @param page - Page number (default: 1)
   * @param size - Page size (default: 100)
   * @returns Categories list with pagination
   */
  async getCategoriesAdmin(page = 1, size = 100): Promise<unknown> {
    try {
      const url = `${API_ENDPOINTS.CATEGORIES_ADMIN}?page=${page}&size=${size}`;
      const headers = adminAuthService.getAuthHeaders();

      const response = await fetch(url, {
        headers: headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. Admin role required.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData as any).error || (errorData as any).message || 'Failed to fetch categories');
      }

      return await response.json();
    } catch (error) {
      console.error('Get categories admin error:', error);
      throw error;
    }
  }

  /**
   * Get category by ID
   * @param id - Category ID
   * @returns Category details
   */
  async getCategoryById(id: string): Promise<unknown> {
    try {
      const response = await fetch(`${API_ENDPOINTS.CATEGORIES_ADMIN}/${id}`, {
        headers: adminAuthService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Category not found');
      }

      return await response.json();
    } catch (error) {
      console.error('Get category by id error:', error);
      throw error;
    }
  }

  /**
   * Create a new category (admin only)
   * @param categoryData - Category data
   * @returns Created category
   */
  async createCategory(categoryData: CategoryData): Promise<unknown> {
    try {
      const response = await fetch(API_ENDPOINTS.CATEGORIES_ADMIN, {
        method: 'POST',
        headers: adminAuthService.getAuthHeaders(),
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as any).error || (error as any).message || 'Failed to create category');
      }

      return await response.json();
    } catch (error) {
      console.error('Create category error:', error);
      throw error;
    }
  }

  /**
   * Update existing category (admin only)
   * @param categoryId - Category ID
   * @param categoryData - Category data
   * @returns Updated category
   */
  async updateCategory(categoryId: string, categoryData: CategoryData): Promise<void> {
    try {
      const response = await fetch(`${API_ENDPOINTS.CATEGORIES_ADMIN}/${categoryId}`, {
        method: 'PUT',
        headers: adminAuthService.getAuthHeaders(),
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as any).error || (error as any).message || 'Failed to update category');
      }
    } catch (error) {
      console.error('Update category error:', error);
      throw error;
    }
  }

  /**
   * Delete category (admin only)
   * @param categoryId - Category ID
   * @returns void
   */
  async deleteCategory(categoryId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_ENDPOINTS.CATEGORIES_ADMIN}/${categoryId}`, {
        method: 'DELETE',
        headers: adminAuthService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      return true;
    } catch (error) {
      console.error('Delete category error:', error);
      throw error;
    }
  }

  /**
   * Upload or replace category image (admin only)
   */
  async uploadCategoryImage(categoryId: string, image: File): Promise<unknown> {
    try {
      const formData = new FormData();
      formData.append('image', image);

      const token = adminAuthService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(API_ENDPOINTS.CATEGORY_IMAGE(categoryId), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error((error as any).error || 'Failed to upload category image');
      }

      return await response.json();
    } catch (error) {
      console.error('Upload category image error:', error);
      throw error;
    }
  }

  /**
   * Delete category image (admin only)
   */
  async deleteCategoryImage(categoryId: string): Promise<void> {
    try {
      const response = await fetch(API_ENDPOINTS.CATEGORY_IMAGE(categoryId), {
        method: 'DELETE',
        headers: adminAuthService.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error((error as any).error || 'Failed to delete category image');
      }
    } catch (error) {
      console.error('Delete category image error:', error);
      throw error;
    }
  }

  /**
   * Activate category (admin only)
   * @param categoryId - Category ID
   * @returns void
   */
  async activateCategory(categoryId: string): Promise<void> {
    try {
      const response = await fetch(`${API_ENDPOINTS.CATEGORIES_ADMIN}/${categoryId}/activate`, {
        method: 'POST',
        headers: adminAuthService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to activate category');
      }
    } catch (error) {
      console.error('Activate category error:', error);
      throw error;
    }
  }

  /**
   * Deactivate category (admin only)
   * @param categoryId - Category ID
   * @returns void
   */
  async deactivateCategory(categoryId: string): Promise<void> {
    try {
      const response = await fetch(`${API_ENDPOINTS.CATEGORIES_ADMIN}/${categoryId}/deactivate`, {
        method: 'POST',
        headers: adminAuthService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to deactivate category');
      }
    } catch (error) {
      console.error('Deactivate category error:', error);
      throw error;
    }
  }

  // Product-Category Relationships

  /**
   * Get all categories for a product
   * @param productId - Product ID
   * @returns List of categories
   */
  async getProductCategories(productId: string | number): Promise<unknown> {
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCT_CATEGORIES(productId), {
        headers: adminAuthService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product categories');
      }

      return await response.json();
    } catch (error) {
      console.error('Get product categories error:', error);
      throw error;
    }
  }

  /**
   * Add a category to a product
   * @param productId - Product ID
   * @param categoryId - Category ID
   * @returns void
   */
  async addProductToCategory(productId: string | number, categoryId: string): Promise<void> {
    try {
      const response = await fetch(API_ENDPOINTS.ADD_PRODUCT_TO_CATEGORY(productId, categoryId), {
        method: 'POST',
        headers: adminAuthService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to add category to product');
      }
    } catch (error) {
      console.error('Add product to category error:', error);
      throw error;
    }
  }

  /**
   * Remove a category from a product
   * @param productId - Product ID
   * @param categoryId - Category ID
   * @returns void
   */
  async removeProductFromCategory(productId: string | number, categoryId: string): Promise<void> {
    try {
      const response = await fetch(API_ENDPOINTS.REMOVE_PRODUCT_FROM_CATEGORY(productId, categoryId), {
        method: 'DELETE',
        headers: adminAuthService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to remove category from product');
      }
    } catch (error) {
      console.error('Remove product from category error:', error);
      throw error;
    }
  }

  /**
   * Get all products in a category
   * @param categoryId - Category ID
   * @returns List of product IDs
   */
  async getCategoryProducts(categoryId: string): Promise<unknown> {
    try {
      const url = API_ENDPOINTS.CATEGORY_PRODUCTS(categoryId);
      console.log('🔵 Fetching category products from:', url);

      const response = await fetch(url, {
        headers: adminAuthService.getAuthHeaders(),
      });

      console.log('🔵 Response status:', response.status);
      console.log('🔵 Response statusText:', response.statusText);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.log('🔴 Response not OK');
        console.log('🔴 Status:', response.status);
        console.log('🔴 StatusText:', response.statusText);
        console.log('🔴 URL:', url);
        console.log('🔴 Body:', errorText);

        if (response.status === 404) {
          console.log('⚠️ 404 - Category not found or no products - returning empty array');
          return [];
        }

        if (response.status === 500) {
          console.log('⚠️ 500 - Server error - returning empty array');
          return [];
        }

        // For any other error, return empty array
        console.log('⚠️ Unknown error (status:', response.status, ') - returning empty array');
        return [];
      }

      const data = await response.json();
      console.log('✅ Category products received:', data);
      return data;
    } catch (error) {
      console.log('❌ Exception in getCategoryProducts:');
      console.log(error);
      // Return empty array on error instead of throwing
      return [];
    }
  }

  /**
   * Get all products in a category (public)
   * @param categoryId - Category ID
   * @returns List of product IDs
   */
  async getCategoryProductsPublic(categoryId: string): Promise<unknown> {
    try {
      const url = API_ENDPOINTS.CATEGORY_PRODUCTS_PUBLIC(categoryId);
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error('Failed to fetch category products');
      }

      return await response.json();
    } catch (error) {
      console.error('Get category products public error:', error);
      return [];
    }
  }
}

export default new CategoryService();
