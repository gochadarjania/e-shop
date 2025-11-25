'use client';

import { useState, useEffect } from 'react';
import { MdClose, MdAdd, MdDelete, MdStar, MdStarBorder } from 'react-icons/md';
import productsService from '@/lib/services/productsService';

interface Product {
  id: string | number;
  slug?: string;
  name?: string;
  price?: number;
  currency?: string;
  shortDesc?: string;
  mainImageUrl?: string;
}

interface ProductImage {
  id: string | number;
  imageUrl: string;
  isMain: boolean;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess?: () => void;
}

const ProductModal = ({ isOpen, onClose, product, onSuccess }: ProductModalProps) => {
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

      // Load product images
      loadProductImages(product.id);
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
    }
    setError('');
    setImageError('');
  }, [product, isOpen]);

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

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Close modal
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MdClose className="text-2xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="product-slug"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              URL-friendly unique identifier (e.g., laptop-dell-xps-15)
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Product name"
              required
            />
          </div>

          {/* Price and Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Description
            </label>
            <textarea
              name="shortDesc"
              value={formData.shortDesc}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Brief product description..."
            />
          </div>

          {/* Images Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images (Max 5)
            </label>

            {imageError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded text-xs mb-3">
                {imageError}
              </div>
            )}

            {/* Existing Images */}
            {images.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-2">Current Images:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {images.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.imageUrl}
                        alt="Product"
                        className="w-full h-24 object-cover rounded border border-gray-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSetMainImage(image.id)}
                          className="p-1 bg-white rounded hover:bg-gray-100"
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
                          className="p-1 bg-white rounded hover:bg-red-100"
                          title="Delete image"
                        >
                          <MdDelete className="text-red-600 text-lg" />
                        </button>
                      </div>
                      {image.isMain && (
                        <span className="absolute top-1 left-1 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded">
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
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-2">New Images:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {newImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="New"
                        className="w-full h-24 object-cover rounded border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        <MdClose className="text-sm" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Images Button */}
            {images.length + newImages.length < 5 && (
              <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-gray-400 transition-colors">
                <MdAdd className="text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Add Images</span>
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

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-[#a3c133] rounded hover:bg-[#92b01f] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
