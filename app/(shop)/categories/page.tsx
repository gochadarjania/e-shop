'use client';

import { useState, useEffect } from 'react';
import CategoryCard from '@/components/client/CategoryCard';
import categoryService from '@/lib/services/categoryService';
import { MdSearch } from 'react-icons/md';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
  imageUrl?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);

        const response: any = await categoryService.getCategories(1, 100);
        const categoriesData = Array.isArray(response)
          ? response
          : response.items || response.data || [];

        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((category) =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">კატეგორიები</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            აირჩიე კატეგორია და იპოვე შენთვის საინტერესო პროდუქტები
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="მოძებნე კატეგორია..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B3D] focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#FF6B3D]"></div>
            <p className="mt-4 text-gray-600">იტვირთება...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
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
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <p className="text-gray-500 text-lg">კატეგორიები არ მოიძებნა</p>
            <p className="text-gray-400 text-sm mt-2">სცადეთ სხვა საძიებო სიტყვის გამოყენება</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  id={category.id}
                  name={category.name}
                  slug={category.slug}
                  description={category.description}
                  imageUrl={category.imageUrl}
                />
              ))}
            </div>

            <div className="mt-8 text-center text-gray-600">
              <p>
                ნაპოვნი: <span className="font-semibold text-gray-900">{filteredCategories.length}</span> კატეგორია
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
