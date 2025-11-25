'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import productsService from '@/lib/services/productsService';
import ProductCard from '@/components/client/ProductCard';
import { MdShoppingCart, MdFavoriteBorder, MdShare, MdChevronLeft } from 'react-icons/md';

interface Product {
  id: string | number;
  slug: string;
  name: string;
  price: number;
  currency?: string;
  shortDesc?: string;
  description?: string;
  mainImageUrl?: string;
  images?: ProductImage[];
}

interface ProductImage {
  id: string | number;
  imageUrl: string;
  isMain?: boolean;
  displayOrder?: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch product by slug
        const productData: any = await productsService.getProductBySlug(slug);
        setProduct(productData);
        const heroImage =
          productData?.mainImageUrl ||
          productData?.images?.find((img: ProductImage) => img.isMain)?.imageUrl ||
          productData?.images?.[0]?.imageUrl ||
          null;
        setSelectedImageUrl(heroImage);

        // Fetch related products (all products for now)
        const productsResponse: any = await productsService.getProducts(1, 4);
        const productsData = Array.isArray(productsResponse)
          ? productsResponse
          : productsResponse.items || productsResponse.data || [];

        // Filter out current product
        const filtered = productsData.filter((p: Product) => p.slug !== slug);
        setRelatedProducts(filtered.slice(0, 4));
      } catch (err) {
        setError('პროდუქტი ვერ მოიძებნა');
        console.error('Error fetching product:', err);
        setSelectedImageUrl(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    console.log('Add to cart:', { product, quantity });
    alert(`${product?.name} დაემატა კალათაში (${quantity} ცალი)`);
  };

  const handleThumbnailClick = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
  };

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

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">პროდუქტი ვერ მოიძებნა</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-[#FF6B3D] text-white rounded-lg hover:bg-[#E55A2C] transition-colors"
          >
            უკან დაბრუნება
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/products"
          className="inline-flex items-center text-gray-600 hover:text-[#FF6B3D] mb-6 transition-colors"
        >
          <MdChevronLeft className="text-xl" />
          <span>უკან პროდუქტებზე</span>
        </Link>

        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Product Image */}
            <div className="flex flex-col gap-4">
              <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                {selectedImageUrl ? (
                  <img
                    src={selectedImageUrl}
                    alt={product.name}
                    className="w-full h-full object-contain p-6"
                  />
                ) : (
                  <div className="text-center p-8">
                    <svg
                      className="mx-auto h-32 w-32 text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-gray-400">No Image Available</p>
                  </div>
                )}
              </div>

              {product.images && product.images.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {product.images.map((image) => {
                    const isSelected = image.imageUrl === selectedImageUrl;
                    return (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => handleThumbnailClick(image.imageUrl)}
                        className={`relative rounded-lg border overflow-hidden aspect-square focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B3D] ${
                          isSelected ? 'border-[#FF6B3D]' : 'border-gray-200'
                        }`}
                        aria-label="აირჩიე გამოსახულება"
                        aria-pressed={isSelected}
                      >
                        <img
                          src={image.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

              {product.shortDesc && (
                <p className="text-gray-600 mb-4">{product.shortDesc}</p>
              )}

              <div className="mb-6">
                <span className="text-4xl font-bold text-[#FF6B3D]">
                  {product.price} {product.currency || 'EUR'}
                </span>
              </div>

              {product.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">აღწერა</h3>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">რაოდენობა</label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold text-gray-900 w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center px-6 py-4 bg-[#FF6B3D] text-white font-semibold rounded-lg hover:bg-[#E55A2C] transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                >
                  <MdShoppingCart className="mr-2 text-xl" />
                  კალათაში დამატება
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-[#FF6B3D] hover:text-[#FF6B3D] transition-colors">
                    <MdFavoriteBorder className="mr-2 text-xl" />
                    რჩეულები
                  </button>
                  <button className="flex items-center justify-center px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-[#FF6B3D] hover:text-[#FF6B3D] transition-colors">
                    <MdShare className="mr-2 text-xl" />
                    გაზიარება
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="border-t pt-6 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  მარაგშია
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  უფასო მიწოდება 100 ლარზე მეტი შეძენისას
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"
                    />
                  </svg>
                  14 დღიანი უფასო დაბრუნება
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">მსგავსი პროდუქტები</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  id={relatedProduct.id}
                  slug={relatedProduct.slug}
                  name={relatedProduct.name}
                  price={relatedProduct.price}
                  currency={relatedProduct.currency}
                  shortDesc={relatedProduct.shortDesc}
                  imageUrl={relatedProduct.mainImageUrl}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
