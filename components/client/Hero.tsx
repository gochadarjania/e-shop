'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

const slides = [
  {
    id: 1,
    title: 'გაზაფხულის კოლექცია',
    subtitle: 'აღმოაჩინე ახალი სტილი',
    description: 'დაზოგე 50%-მდე შერჩეულ პროდუქტებზე',
    image: '/images/hero-1.jpg',
    buttonText: 'ყიდვა',
    buttonLink: '/products',
  },
  {
    id: 2,
    title: 'ექსკლუზიური შეთავაზება',
    subtitle: 'სპეციალური ფასები',
    description: 'მხოლოდ ამ კვირას - განსაკუთრებული ფასდაკლება',
    image: '/images/hero-2.jpg',
    buttonText: 'იხილე მეტი',
    buttonLink: '/products',
  },
  {
    id: 3,
    title: 'ახალი პროდუქტები',
    subtitle: 'უახლესი ტრენდები',
    description: 'შეიძინე ბოლო სიახლეები დღესვე',
    image: '/images/hero-3.jpg',
    buttonText: 'ნახე ახალი',
    buttonLink: '/products',
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative h-[500px] md:h-[600px] overflow-hidden bg-gray-900">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Background with overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 z-10" />
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundColor: '#2A2A2A', // fallback
            }}
          />

          {/* Content */}
          <div className="relative z-20 h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-xl">
                <p className="text-[#FF6B3D] text-sm md:text-base font-semibold mb-2 uppercase tracking-wider">
                  {slide.subtitle}
                </p>
                <h1 className="text-white text-4xl md:text-6xl font-bold mb-4 leading-tight">
                  {slide.title}
                </h1>
                <p className="text-gray-200 text-base md:text-lg mb-8">
                  {slide.description}
                </p>
                <Link
                  href={slide.buttonLink}
                  className="inline-block px-8 py-3 bg-[#FF6B3D] text-white font-semibold rounded-lg hover:bg-[#E55A2C] transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl uppercase tracking-wide text-sm"
                >
                  {slide.buttonText}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-all"
        aria-label="Previous slide"
      >
        <MdChevronLeft className="text-3xl" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-all"
        aria-label="Next slide"
      >
        <MdChevronRight className="text-3xl" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide ? 'bg-[#FF6B3D] w-8' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
