'use client';

import { useState, useEffect } from 'react';
import { MdClose, MdAdd, MdDelete, MdStar, MdStarBorder } from 'react-icons/md';
import productsService from '@/lib/services/productsService';
import categoryService from '@/lib/services/categoryService';

interface Product {
  id: string | number;
  slug?: string;
  name?: string;
  price?: number;
  currency?: string;
  shortDesc?: string;
}

interface ProductImage {
  id: string | number;
  imageUrl: string;
  isMain: boolean;
}

interface Category {
  id: string;
  name: string;
  slug?: string;
  isActive?: boolean;
}

interface ProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess?: () => void;
}

const ProductDrawer = ({ isOpen, onClose, product, onSuccess }: ProductDrawerProps) => {
  const [formData, setFormData] = useState({
    slug: '',
    name: '',
    price: '',
    currency: 'EUR',
    shortDesc: '',
  });
  const [images, setImages] = useState<ProductImage[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');

  // Categories
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // Load all categories when drawer opens
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // Populate form when editing existing product
  useEffect(() => {
    if (product) {
      setFormData({
        slug: product.slug || '',
        name: product.name || '',
        price: product.price?.toString() || '',
        currency: product.currency || 'EUR',
        shortDesc: product.shortDesc || '',
      });

      // Load product images and categories
      loadProductImages(product.id);
      loadProductCategories(product.id);
    } else {
      // Reset form for new product
      setFormData({
        slug: '',
        name: '',
        price: '',
        currency: 'EUR',
        shortDesc: '',
      });
      setImages([]);
      setNewImages([]);
      setSelectedCategoryIds([]);
    }
    setError('');
    setImageError('');
  }, [product, isOpen]);

  const loadCategories = async () => {
    try {
      const response: any = await categoryService.getCategoriesAdmin(1, 100);
      const categories = response.items || response.data || [];
      // Only show active categories
      setAllCategories(categories.filter((cat: Category) => cat.isActive));
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadProductCategories = async (productId: string | number) => {
    try {
      const categories: any = await categoryService.getProductCategories(productId);
      if (Array.isArray(categories)) {
        setSelectedCategoryIds(categories.map((cat: Category) => cat.id));
      }
    } catch (err) {
      console.error('Failed to load product categories:', err);
    }
  };

  const loadProductImages = async (productId: string | number) => {
    try {
      const productImages = await productsService.getProductImages(productId);
      setImages(productImages as ProductImage[]);
    } catch (err) {
      console.error('Failed to load images:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const totalImages = images.length + newImages.length + files.length;

    if (totalImages > 5) {
      setImageError('Maximum 5 images allowed per product');
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      setImageError('Only JPEG, PNG, and GIF images are allowed');
      return;
    }

    setImageError('');
    setNewImages((prev) => [...prev, ...files]);
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setImageError('');
  };

  const handleDeleteImage = async (imageId: string | number) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      await productsService.deleteProductImage(product!.id, imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      setImageError((err as Error).message || 'Failed to delete image');
    }
  };

  const handleSetMainImage = async (imageId: string | number) => {
    try {
      await productsService.setMainProductImage(product!.id, imageId);
      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          isMain: img.id === imageId,
        }))
      );
    } catch (err) {
      setImageError((err as Error).message || 'Failed to set main image');
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategoryIds((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.slug || !formData.name || !formData.price) {
        setError('Slug, Name, and Price are required');
        setLoading(false);
        return;
      }

      if (parseFloat(formData.price) <= 0) {
        setError('Price must be greater than 0');
        setLoading(false);
        return;
      }

      let productId;

      if (product) {
        // Update existing product
        await productsService.updateProduct(product.id, {
          ...formData,
          price: parseFloat(formData.price),
        });
        productId = product.id;
      } else {
        // Create new product
        const response: any = await productsService.createProduct({
          ...formData,
          price: parseFloat(formData.price),
        });
        productId = response.id;
      }

      // Upload new images if any
      if (newImages.length > 0) {
        try {
          await productsService.uploadProductImages(productId, newImages);
        } catch (err) {
          setImageError((err as Error).message || 'Failed to upload images');
          // Don't return - product was saved successfully
        }
      }

      // Update product categories (only for existing products)
      if (product) {
        try {
          // Get current categories
          const currentCategories: any = await categoryService.getProductCategories(productId);
          const currentCategoryIds = Array.isArray(currentCategories)
            ? currentCategories.map((cat: Category) => cat.id)
            : [];

          // Find categories to add and remove
          const categoriesToAdd = selectedCategoryIds.filter(id => !currentCategoryIds.includes(id));
          const categoriesToRemove = currentCategoryIds.filter(id => !selectedCategoryIds.includes(id));

          // Remove old categories
          for (const categoryId of categoriesToRemove) {
            await categoryService.removeProductFromCategory(productId, categoryId);
          }

          // Add new categories
          for (const categoryId of categoriesToAdd) {
            await categoryService.addProductToCategory(productId, categoryId);
          }
        } catch (err) {
          console.error('Failed to update categories:', err);
          // Don't fail the whole operation
        }
      } else {
        // For new products, just add selected categories
        try {
          for (const categoryId of selectedCategoryIds) {
            await categoryService.addProductToCategory(productId, categoryId);
          }
        } catch (err) {
          console.error('Failed to add categories:', err);
        }
      }

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Close drawer
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to save product');
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
            {product ? 'Edit Product' : 'Add New Product'}
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
                placeholder="product-slug"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                URL-friendly unique identifier (e.g., laptop-dell-xps-15)
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Product name"
                required
              />
            </div>

            {/* Price and Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0.01"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  <option value="GEL">GEL</option>
                </select>
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
              </label>
              <textarea
                name="shortDesc"
                value={formData.shortDesc}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                placeholder="Brief product description..."
              />
            </div>

            {/* Categories Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Categories
              </label>
              {allCategories.length === 0 ? (
                <p className="text-sm text-gray-500">No categories available. Please create categories first.</p>
              ) : (
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {allCategories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategoryIds.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              )}
              {selectedCategoryIds.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {selectedCategoryIds.length} {selectedCategoryIds.length === 1 ? 'category' : 'categories'} selected
                </p>
              )}
            </div>

            {/* Images Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Product Images (Max 5)
              </label>

              {imageError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded text-xs mb-4">
                  {imageError}
                </div>
              )}

              {/* Existing Images */}
              {images.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-2 font-medium">Current Images:</p>
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.imageUrl}
                          alt="Product"
                          className="w-full h-28 object-cover rounded-lg border border-gray-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSetMainImage(image.id)}
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                            title={image.isMain ? 'Main image' : 'Set as main'}
                          >
                            {image.isMain ? (
                              <MdStar className="text-yellow-500 text-lg" />
                            ) : (
                              <MdStarBorder className="text-gray-600 text-lg" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(image.id)}
                            className="p-2 bg-white rounded-full hover:bg-red-100 transition-colors"
                            title="Delete image"
                          >
                            <MdDelete className="text-red-600 text-lg" />
                          </button>
                        </div>
                        {image.isMain && (
                          <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded font-medium">
                            Main
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images Preview */}
              {newImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-2 font-medium">New Images:</p>
                  <div className="grid grid-cols-3 gap-3">
                    {newImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="New"
                          className="w-full h-28 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <MdClose className="text-base" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Images Button */}
              {images.length + newImages.length < 5 && (
                <label className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all">
                  <MdAdd className="text-gray-400 mr-2 text-xl" />
                  <span className="text-sm text-gray-600 font-medium">Add Images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              )}
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
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProductDrawer;
