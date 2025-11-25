'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MdChevronLeft } from 'react-icons/md';

import categoryService from '@/lib/services/categoryService';
import productsService from '@/lib/services/productsService';
import ProductCard from '@/components/client/ProductCard';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

interface Product {
  id: string | number;
  slug: string;
  name: string;
  price: number;
  currency?: string;
  shortDesc?: string;
  mainImageUrl?: string;
}

const PAGE_SIZE = 100;

export default function CategoryDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError('');

        // Fetch category details
        const categoryData = (await categoryService.getCategoryBySlug(slug)) as Category;
        setCategory(categoryData);

        // Fetch product ids for the category
        const productIdsResponse = await categoryService.getCategoryProductsPublic(categoryData.id);
        const productIds = Array.isArray(productIdsResponse) ? productIdsResponse : [];
        const productIdSet = new Set(productIds.map((id) => String(id).toLowerCase()));

        if (productIdSet.size === 0) {
          setProducts([]);
          return;
        }

        // Fetch products paginated until we collect all matches
        const matchedProducts: Product[] = [];
        let page = 1;
        let totalPages = 1;

        do {
          const productsResponse = await productsService.getProducts(page, PAGE_SIZE);
          const productsPayload: {
            items?: Product[];
            data?: Product[];
            totalPages?: number;
            total_pages?: number;
            totalCount?: number;
          } = Array.isArray(productsResponse)
            ? { items: productsResponse }
            : (productsResponse as {
                items?: Product[];
                data?: Product[];
                totalPages?: number;
                total_pages?: number;
                totalCount?: number;
              });
          const productList = productsPayload.items || productsPayload.data || [];

          productList.forEach((product: Product) => {
            if (product?.id && productIdSet.has(String(product.id).toLowerCase())) {
              matchedProducts.push(product);
            }
          });

          const totalCountValue =
            typeof productsPayload.totalCount === 'number' ? productsPayload.totalCount : productList.length;
          const calculatedTotalPages =
            productsPayload.totalPages ||
            productsPayload.total_pages ||
            Math.max(1, Math.ceil((totalCountValue || PAGE_SIZE) / PAGE_SIZE));
          totalPages = calculatedTotalPages;

          page += 1;
        } while (page <= totalPages && matchedProducts.length < productIdSet.size);

        setProducts(matchedProducts);
      } catch (err) {
        console.error('Failed to load category page:', err);
        setError('კატეგორია ვერ მოიძებნა');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#FF6B3D]"></div>
          <p className="mt-4 text-gray-600">იტვირთება...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">404 - კატეგორია ვერ მოიძებნა</h1>
          <p className="text-gray-600 mb-6">{error || 'შეამოწმეთ ბმული და სცადეთ თავიდან.'}</p>
          <Link
            href="/categories"
            className="inline-flex items-center px-6 py-3 bg-[#FF6B3D] text-white rounded-lg hover:bg-[#E55A2C] transition-colors"
          >
            <MdChevronLeft className="text-xl mr-2" />
            უკან კატეგორიებზე
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {category.imageUrl && (
          <div className="mb-8">
            <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={category.imageUrl}
                alt={category.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-sm uppercase tracking-wider text-white/80">კატეგორია</p>
                <h1 className="text-3xl font-bold">{category.name}</h1>
              </div>
            </div>
          </div>
        )}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href="/categories"
            className="inline-flex items-center text-gray-600 hover:text-[#FF6B3D] transition-colors"
          >
            <MdChevronLeft className="text-xl mr-2" />
            ყველა კატეგორია
          </Link>

          <div className="text-right">
            <p className="text-sm text-gray-500 uppercase tracking-wide">კატეგორია</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{category.name}</h1>
          </div>
        </div>

        {category.description && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">აღწერა</h2>
            <p className="text-gray-600 leading-relaxed">{category.description}</p>
          </div>
        )}

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">პროდუქტები</h2>
            <span className="text-gray-600">
              ნაპოვნი: <strong>{products.length}</strong>
            </span>
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-lg">ამ კატეგორიაში პროდუქტები ჯერ არ არის.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </section>
      </div>
    </div>
  );
}

