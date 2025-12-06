'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ShoppingCart, BarChart3, DollarSign, TrendingUp } from 'lucide-react';

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const getSlideIcon = (id) => {
    const iconProps = { className: 'w-24 h-24' };
    switch(id) {
      case 1: return <ShoppingCart {...iconProps} />;
      case 2: return <BarChart3 {...iconProps} />;
      case 3: return <DollarSign {...iconProps} />;
      case 4: return <TrendingUp {...iconProps} />;
      default: return <ShoppingCart {...iconProps} />;
    }
  };

  const slides = [
    {
      id: 1,
      title: 'Grow Your Business on Flipkart',
      subtitle: 'Learn proven strategies to boost your sales and reach millions of customers',
      color: 'from-blue-100 to-cyan-100',
      textColor: 'text-blue-900',
    },
    {
      id: 2,
      title: 'Optimize Your Product Listings',
      subtitle: 'Master SEO, keywords, and descriptions to rank higher on Flipkart',
      color: 'from-purple-100 to-pink-100',
      textColor: 'text-purple-900',
    },
    {
      id: 3,
      title: 'Maximize Your Profits',
      subtitle: 'Understand pricing, margins, and logistics to increase your ROI',
      color: 'from-green-100 to-emerald-100',
      textColor: 'text-green-900',
    },
    {
      id: 4,
      title: 'Scale Your Brand',
      subtitle: 'Advanced marketing tactics and customer retention strategies',
      color: 'from-amber-100 to-orange-100',
      textColor: 'text-amber-900',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="relative w-full h-screen md:h-96 lg:h-[500px]">
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className={`h-full bg-gradient-to-r ${slide.color} flex items-center justify-center`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {/* Left Content */}
                  <div className="text-center md:text-left order-2 md:order-1">
                    <h1 className={`text-5xl md:text-6xl font-black mb-4 leading-tight ${slide.textColor}`}>
                      {slide.title}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
                      {slide.subtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                      <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 font-semibold text-lg">
                        Register Now
                      </Button>
                      <Button
                        variant="outline"
                        className="border-gray-900 text-gray-900 hover:bg-gray-100 px-8 py-3 font-semibold text-lg"
                      >
                        Learn More
                      </Button>
                    </div>
                  </div>

                  {/* Right Image */}
                  <div className="flex justify-center items-center order-1 md:order-2">
                    <div className="text-blue-600 animate-bounce">
                      {getSlideIcon(slide.id)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full transition-all shadow-lg"
          aria-label="Previous slide"
        >
          <ChevronLeft size={32} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full transition-all shadow-lg"
          aria-label="Next slide"
        >
          <ChevronRight size={32} />
        </button>

        {/* Dots Navigation */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all rounded-full ${
                index === currentSlide
                  ? 'bg-gray-900 w-10 h-3'
                  : 'bg-white/60 hover:bg-white/80 w-3 h-3'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
