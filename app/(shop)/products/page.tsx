'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/client/ProductCard';
import productsService from '@/lib/services/productsService';
import categoryService from '@/lib/services/categoryService';
import { MdSearch, MdFilterList } from 'react-icons/md';

interface Product {
  id: string | number;
  slug: string;
  name: string;
  price: number;
  currency?: string;
  shortDesc?: string;
  mainImageUrl?: string;
}

interface Category {
  id: string;
  name: string;
  isActive?: boolean;
  slug?: string;
  imageUrl?: string;
  showOnHomePage?: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [categoryProductIds, setCategoryProductIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('name-asc');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch products
        const productsResponse: any = await productsService.getProducts(1, 100);
        const productsData = Array.isArray(productsResponse)
          ? productsResponse
          : productsResponse.items || productsResponse.data || [];
        setProducts(productsData);

        // Fetch categories
        const categoriesResponse: any = await categoryService.getCategories(1, 100);
        const categoriesData = Array.isArray(categoriesResponse)
          ? categoriesResponse
          : categoriesResponse.items || categoriesResponse.data || [];

        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryChange = async (categoryId: string) => {
    setSelectedCategoryId(categoryId);

    if (!categoryId) {
      setCategoryProductIds([]);
      return;
    }

    try {
      const productIds: any = await categoryService.getCategoryProductsPublic(categoryId);
      if (Array.isArray(productIds) && productIds.length > 0) {
        setCategoryProductIds(productIds.map((id) => String(id).toLowerCase()));
      } else {
        setCategoryProductIds([]);
      }
    } catch (error) {
      console.error('Failed to fetch category products:', error);
      setCategoryProductIds([]);
    }
  };

  // Filter and sort products
  const filteredProducts = products.filter((product) => {
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

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return (a.name || '').localeCompare(b.name || '');
      case 'name-desc':
        return (b.name || '').localeCompare(a.name || '');
      case 'price-asc':
        return (a.price || 0) - (b.price || 0);
      case 'price-desc':
        return (b.price || 0) - (a.price || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">ყველა პროდუქტი</h1>
          <p className="text-gray-600">აღმოაჩინე ჩვენი სრული კოლექცია</p>
        </div>

        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Sidebar - Filters */}
          <aside className="lg:col-span-1">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden w-full mb-4 flex items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
            >
              <MdFilterList className="mr-2" />
              ფილტრები
            </button>

            {/* Filters */}
            <div
              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:sticky lg:top-20 ${
                showMobileFilters ? 'block' : 'hidden lg:block'
              }`}
            >
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">ძიება</label>
                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="მოძებნე პროდუქტი..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B3D] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">კატეგორიები</label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={selectedCategoryId === ''}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-4 h-4 text-[#FF6B3D] focus:ring-[#FF6B3D]"
                    />
                    <span className="ml-2 text-sm text-gray-700">ყველა პროდუქტი</span>
                  </label>
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="radio"
                        name="category"
                        value={category.id}
                        checked={selectedCategoryId === category.id}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-4 h-4 text-[#FF6B3D] focus:ring-[#FF6B3D]"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(searchTerm || selectedCategoryId) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategoryId('');
                    setCategoryProductIds([]);
                  }}
                  className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  გაწმენდა
                </button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{sortedProducts.length}</span> პროდუქტი
                  {selectedCategoryId && (
                    <span className="ml-2 text-[#FF6B3D]">
                      ({categories.find((c) => c.id === selectedCategoryId)?.name})
                    </span>
                  )}
                </p>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <label htmlFor="sort" className="text-sm text-gray-600">
                    დალაგება:
                  </label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B3D] focus:border-transparent"
                  >
                    <option value="name-asc">სახელი: ა-ჰ</option>
                    <option value="name-desc">სახელი: ჰ-ა</option>
                    <option value="price-asc">ფასი: ზრდადობით</option>
                    <option value="price-desc">ფასი: კლებადობით</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#FF6B3D]"></div>
                <p className="mt-4 text-gray-600">იტვირთება...</p>
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="text-gray-500 text-lg">პროდუქტები არ მოიძებნა</p>
                <p className="text-gray-400 text-sm mt-2">სცადეთ სხვა ფილტრის გამოყენება</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    slug={product.slug}
                    name={product.name}
                    price={product.price}
                    currency={product.currency}
                    shortDesc={product.shortDesc}
                    imageUrl={product.mainImageUrl}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
