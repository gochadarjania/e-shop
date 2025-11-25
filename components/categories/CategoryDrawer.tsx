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
  imageUrl?: string;
  showOnHomePage?: boolean;
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
    showOnHomePage: false,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);

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
        showOnHomePage: !!category.showOnHomePage,
      });
      setImagePreview(category.imageUrl || null);
      setRemoveExistingImage(false);
      setImageFile(null);
    } else {
      // Reset form for new category
      setFormData({
        name: '',
        slug: '',
        description: '',
        parentCategoryId: '',
        displayOrder: '0',
        showOnHomePage: false,
      });
      setImagePreview(null);
      setRemoveExistingImage(false);
      setImageFile(null);
    }
    setError('');
    setImageError('');
  }, [category, isOpen]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImageError('Only JPG, PNG, or WEBP images are allowed');
      return;
    }

    setImageError('');
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(URL.createObjectURL(file));
    setImageFile(file);
    setRemoveExistingImage(false);
  };

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImageFile(null);
    setRemoveExistingImage(true);
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
        showOnHomePage: formData.showOnHomePage,
      };

      let categoryId = category?.id;

      if (category) {
        // Update existing category
        await categoryService.updateCategory(category.id, categoryData);
        categoryId = category.id;
      } else {
        // Create new category
        const response: any = await categoryService.createCategory(categoryData);
        categoryId = response?.id;
      }

      if (categoryId) {
        if (imageFile) {
          try {
            await categoryService.uploadCategoryImage(categoryId, imageFile);
          } catch (imageErr) {
            setImageError((imageErr as Error).message || 'Failed to upload image');
          }
        } else if (removeExistingImage && category?.imageUrl) {
          try {
            await categoryService.deleteCategoryImage(categoryId);
          } catch (imageErr) {
            setImageError((imageErr as Error).message || 'Failed to delete image');
          }
        }
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

            {/* Show on Home Page */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="showOnHomePage"
                name="showOnHomePage"
                checked={formData.showOnHomePage}
                onChange={handleCheckboxChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="showOnHomePage" className="text-sm text-gray-700">
                Display this category on the home page
              </label>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Image
              </label>
              {imageError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-xs mb-3">
                  {imageError}
                </div>
              )}
              {imagePreview ? (
                <div className="relative w-full h-48 border border-gray-200 rounded-lg overflow-hidden mb-3">
                  <img src={imagePreview} alt="Category" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 px-3 py-1 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 text-sm mb-3">
                  No image selected
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended formats: JPG, PNG, WEBP. Max size 5MB.
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
