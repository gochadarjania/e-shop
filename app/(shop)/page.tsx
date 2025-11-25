'use client';

import { useState, useEffect } from 'react';
import Hero from '@/components/client/Hero';
import ProductCard from '@/components/client/ProductCard';
import CategoryCard from '@/components/client/CategoryCard';
import productsService from '@/lib/services/productsService';
import categoryService from '@/lib/services/categoryService';
import Link from 'next/link';

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
  slug: string;
  description?: string;
  isActive?: boolean;
  imageUrl?: string;
  showOnHomePage?: boolean;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch products
        const productsResponse: any = await productsService.getProducts(1, 8);
        const productsData = Array.isArray(productsResponse)
          ? productsResponse
          : productsResponse.items || productsResponse.data || [];
        setProducts(productsData);

        // Fetch categories for home page
        const categoriesResponse: any = await categoryService.getHomeCategories(6);
        let categoriesData = Array.isArray(categoriesResponse)
          ? categoriesResponse
          : categoriesResponse.items || categoriesResponse.data || [];

        // Fall back to the generic categories endpoint when the home endpoint is empty
        if (!categoriesData.length) {
          const fallbackResponse: any = await categoryService.getCategories(1, 6);
          categoriesData = Array.isArray(fallbackResponse)
            ? fallbackResponse
            : fallbackResponse.items || fallbackResponse.data || [];
        }

        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <Hero />

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">კატეგორიები</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              აღმოაჩინე პროდუქტები კატეგორიების მიხედვით
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#FF6B3D]"></div>
              <p className="mt-4 text-gray-600">იტვირთება...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              კატეგორიები არ მოიძებნა
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
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
          )}

          {categories.length > 0 && (
            <div className="text-center mt-12">
              <Link
                href="/categories"
                className="inline-block px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg border-2 border-gray-300 hover:border-[#FF6B3D] hover:text-[#FF6B3D] transition-all duration-300"
              >
                ყველა კატეგორია
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Latest Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#FF6B3D] text-sm font-semibold mb-2 uppercase tracking-wider">
              ახალი პროდუქტები
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">უახლესი შემოსვლა</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              შეიძინე ბოლო სიახლეები დღესვე და იყავი ტრენდში
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#FF6B3D]"></div>
              <p className="mt-4 text-gray-600">იტვირთება...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              პროდუქტები არ მოიძებნა
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
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

          {products.length > 0 && (
            <div className="text-center mt-12">
              <Link
                href="/products"
                className="inline-block px-8 py-3 bg-[#FF6B3D] text-white font-semibold rounded-lg hover:bg-[#E55A2C] transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl uppercase tracking-wide text-sm"
              >
                ყველა პროდუქტი
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FF6B3D] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">უფასო მიწოდება</h3>
              <p className="text-gray-600">100 ლარზე მეტი შეძენისას</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#FF6B3D] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">უსაფრთხო გადახდა</h3>
              <p className="text-gray-600">100% დაცული ტრანზაქციები</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#FF6B3D] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">14 დღიანი დაბრუნება</h3>
              <p className="text-gray-600">ნებისმიერი მიზეზით</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
