import { useState, useEffect } from 'react';

interface Category {
  id: number;
  name: string;
  image: string;
}

const categories: Category[] = [
  {
    id: 1,
    name: 'Historical Events',
    image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&auto=format&fit=crop'
  },
  {
    id: 2,
    name: 'Science & Technology',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop'
  },
  {
    id: 3,
    name: 'Food & Cooking',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop'
  },
  {
    id: 4,
    name: 'Gym & Fitness',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop'
  },
  {
    id: 5,
    name: 'Parenting',
    image: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&auto=format&fit=crop'
  },
  {
    id: 6,
    name: 'Nostalgia (90s/2000s kids)',
    image: 'https://images.unsplash.com/photo-1558742619-fd82741daa99?w=800&auto=format&fit=crop'
  },
  {
    id: 7,
    name: 'Travel',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop'
  },
  {
    id: 8,
    name: 'Pop Culture & Entertainment',
    image: 'https://images.unsplash.com/photo-1586899028174-e7098604235b?w=800&auto=format&fit=crop'
  },
  {
    id: 9,
    name: 'Video Games',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop'
  },
  {
    id: 10,
    name: 'Animals',
    image: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=800&auto=format&fit=crop'
  }
];

const CategorySlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % categories.length);
    }, 5000); // Change category every 5 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-4/5 h-1/4 mx-auto mb-8 overflow-hidden rounded-xl shadow-xl">
      <div 
        className="relative w-full h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateY(-${currentIndex * 100}%)` }}
      >
        {categories.map((category, index) => (
          <div
            key={category.id}
            className="absolute w-full h-full"
            style={{ top: `${index * 100}%` }}
          >
            <div 
              className="relative w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${category.image})` }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <h2 className="text-4xl font-bold text-white text-center">
                  {category.name}
                </h2>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {categories.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 
              ${index === currentIndex ? 'bg-white w-4' : 'bg-white/50'}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default CategorySlider;