import Link from 'next/link';
import { MdShoppingCart } from 'react-icons/md';

interface ProductCardProps {
  id: string | number;
  slug: string;
  name: string;
  price: number;
  currency?: string;
  shortDesc?: string;
  imageUrl?: string;
}

export default function ProductCard({
  slug,
  name,
  price,
  currency = 'EUR',
  shortDesc,
  imageUrl,
}: ProductCardProps) {
  return (
    <div className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
      <Link href={`/products/${slug}`}>
        {/* Image */}
        <div className="relative h-64 bg-gray-100 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}

          {/* Quick View Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-[#FF6B3D] transition-colors">
            {name}
          </h3>

          {shortDesc && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {shortDesc}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-[#FF6B3D]">
              {price} {currency}
            </span>

            <button
              onClick={(e) => {
                e.preventDefault();
                // Add to cart logic
                console.log('Add to cart:', slug);
              }}
              className="p-2 bg-[#FF6B3D] text-white rounded-full hover:bg-[#E55A2C] transition-colors"
              aria-label="Add to cart"
            >
              <MdShoppingCart className="text-lg" />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}
