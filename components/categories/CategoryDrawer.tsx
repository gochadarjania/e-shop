'use client';

import { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import categoryService from '@/lib/services/categoryService';

interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  parentCategoryId?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

interface CategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSuccess?: () => void;
}

const CategoryDrawer = ({ isOpen, onClose, category, onSuccess }: CategoryDrawerProps) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentCategoryId: '',
    displayOrder: '0',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load all categories for parent selection
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // Populate form when editing existing category
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        parentCategoryId: category.parentCategoryId || '',
        displayOrder: category.displayOrder?.toString() || '0',
      });
    } else {
      // Reset form for new category
      setFormData({
        name: '',
        slug: '',
        description: '',
        parentCategoryId: '',
        displayOrder: '0',
      });
    }
    setError('');
  }, [category, isOpen]);

  const loadCategories = async () => {
    try {
      const response: any = await categoryService.getCategoriesAdmin(1, 100);
      setCategories(response.items || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      // Only auto-generate slug if it's empty or we're creating a new category
      slug: !category && !prev.slug ? name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name || !formData.slug) {
        setError('Name and Slug are required');
        setLoading(false);
        return;
      }

      if (parseInt(formData.displayOrder) < 0) {
        setError('Display Order must be 0 or greater');
        setLoading(false);
        return;
      }

      const categoryData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        parentCategoryId: formData.parentCategoryId || null,
        displayOrder: parseInt(formData.displayOrder),
        isActive: true,
      };

      if (category) {
        // Update existing category
        await categoryService.updateCategory(category.id, categoryData);
      } else {
        // Create new category
        await categoryService.createCategory(categoryData);
      }

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Close drawer
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">
            {category ? 'Edit Category' : 'Add New Category'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <MdClose className="text-2xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Category name"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="category-slug"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                URL-friendly unique identifier (e.g., electronics, home-appliances)
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                placeholder="Brief category description..."
              />
            </div>

            {/* Parent Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Category
              </label>
              <select
                name="parentCategoryId"
                value={formData.parentCategoryId}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">None (Root Category)</option>
                {categories
                  .filter((cat) => cat.id !== category?.id) // Don't allow setting self as parent
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Optional: Select a parent category to create a hierarchical structure
              </p>
            </div>

            {/* Display Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="0"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower numbers appear first in the list
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 p-6 bg-gray-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-medium text-white bg-[#a3c133] rounded-lg hover:bg-[#92b01f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={loading}
            >
              {loading ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CategoryDrawer;
