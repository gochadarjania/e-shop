'use client';

import { useState, useEffect, useRef } from 'react';
import { MdFileUpload, MdFileDownload, MdAdd, MdSearch, MdEdit } from 'react-icons/md';
import productsService from '@/lib/services/productsService';
import categoryService from '@/lib/services/categoryService';
import ProductDrawer from '@/components/products/ProductDrawer';

interface Product {
  id: string | number;
  slug?: string;
  name?: string;
  price?: number;
  currency?: string;
  shortDesc?: string;
}

interface Category {
  id: string;
  name: string;
  isActive?: boolean;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [categoryProductIds, setCategoryProductIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const hasFetched = useRef(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response: any = await productsService.getProductsAdmin(1, 100);

      if (Array.isArray(response)) {
        setProducts(response);
      } else if (response.items || response.data) {
        setProducts(response.items || response.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      let errorMessage = (err as Error).message || 'Failed to fetch products';

      // Add helpful context for common errors
      if (errorMessage.includes('Cloudinary') || errorMessage.includes('cloudinary')) {
        errorMessage = 'Backend configuration error: Cloudinary is not properly configured. Please contact your system administrator to set up CLOUDINARY_URL environment variable.';
      } else if (errorMessage.includes('500')) {
        errorMessage = 'Server error occurred. Please try again later or contact support.';
      }

      setError(errorMessage);
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response: any = await categoryService.getCategoriesAdmin(1, 100);
      const allCategories = response.items || response.data || [];
      // Only show active categories
      setCategories(allCategories.filter((cat: Category) => cat.isActive));
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    // Prevent double fetch in React Strict Mode (development)
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchProducts();
    fetchCategories();
  }, []);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleModalSuccess = () => {
    fetchProducts();
  };

  const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    setSelectedCategoryId(categoryId);

    if (!categoryId) {
      // If "All Categories" selected, clear the filter
      setCategoryProductIds([]);
      return;
    }

    try {
      // Fetch products for selected category
      const productIds: any = await categoryService.getCategoryProducts(categoryId);
      console.log('Received product IDs for category:', categoryId, productIds);

      if (Array.isArray(productIds) && productIds.length > 0) {
        // Convert Guids to string array
        setCategoryProductIds(productIds.map(id => String(id).toLowerCase()));
      } else {
        // Empty array - no products in this category
        setCategoryProductIds([]);
      }
    } catch (err) {
      console.error('Failed to fetch category products:', err);
      setCategoryProductIds([]);
    }
  };

  // Filter products by search term and category
  const filteredProducts = products.filter(product => {
    // Search filter
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.slug?.toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter
    const matchesCategory =
      categoryProductIds.length === 0 ||
      categoryProductIds.includes(String(product.id).toLowerCase());

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded m-6">
        {error}
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800">Products</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center px-3 md:px-4 py-2 text-xs md:text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">
            <MdFileUpload className="mr-1 md:mr-2" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button className="flex items-center px-3 md:px-4 py-2 text-xs md:text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">
            <MdFileDownload className="mr-1 md:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={handleAddProduct}
            className="flex items-center px-3 md:px-4 py-2 text-xs md:text-sm text-white bg-[#a3c133] rounded hover:bg-[#92b01f]"
          >
            <MdAdd className="mr-1 md:mr-2" />
            Add
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 md:mb-6">
        <div className="p-3 md:p-4 space-y-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for Product"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters - Hidden on mobile, show on medium+ screens */}
          <div className="hidden md:flex items-center space-x-3">
            <select
              value={selectedCategoryId}
              onChange={handleCategoryChange}
              className="px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-3 md:px-4 pb-3 flex items-center justify-between">
          <span className="text-xs md:text-sm text-gray-600">
            {filteredProducts.length} products
            {selectedCategoryId && (
              <span className="ml-2 text-blue-600">
                in {categories.find(c => c.id === selectedCategoryId)?.name || 'selected category'}
              </span>
            )}
          </span>
          {selectedCategoryId && (
            <button
              onClick={() => {
                setSelectedCategoryId('');
                setCategoryProductIds([]);
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Products Table - Desktop */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-4 py-3">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded mr-3 flex items-center justify-center">
                        <span className="text-xs text-gray-500">No img</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        {product.shortDesc && (
                          <div className="text-xs text-gray-500 mt-1">
                            {product.shortDesc}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.slug || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                      ∞
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {product.price} {product.currency || 'EUR'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition-colors"
                      title="Edit product"
                    >
                      <MdEdit className="text-lg" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Products Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
            No products found
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-start space-x-3">
                <input type="checkbox" className="rounded border-gray-300 mt-1" />
                <div className="h-16 w-16 flex-shrink-0 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-500">No img</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {product.name}
                    </h3>
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded ml-2"
                      title="Edit product"
                    >
                      <MdEdit className="text-lg" />
                    </button>
                  </div>
                  {product.shortDesc && (
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                      {product.shortDesc}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">SKU: {product.slug || '-'}</span>
                    <span className="font-medium text-gray-900">
                      {product.price} {product.currency || 'EUR'}
                    </span>
                  </div>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mr-1"></span>
                    Stock: ∞
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Product Drawer */}
      <ProductDrawer
        isOpen={isModalOpen}
        onClose={handleModalClose}
        product={selectedProduct}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
