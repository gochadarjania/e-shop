import Link from 'next/link';

interface CategoryCardProps {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export default function CategoryCard({ name, slug, description, imageUrl }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${slug}`}
      className="group relative h-64 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
    >
      {/* Background Image */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#FF6B3D] to-[#E55A2C]" />
        )}
      </div>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-6">
        <h3 className="text-white text-2xl font-bold mb-2 group-hover:text-[#FF6B3D] transition-colors">
          {name}
        </h3>
        {description && (
          <p className="text-gray-200 text-sm line-clamp-2">
            {description}
          </p>
        )}
        <div className="mt-4">
          <span className="text-white text-sm font-semibold inline-flex items-center group-hover:text-[#FF6B3D] transition-colors">
            იხილეთ პროდუქტები
            <svg
              className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
